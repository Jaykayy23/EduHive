import nltk
import spacy
from Questgen import main
import random
import re

# Monkey-patch for spacy.load() to fix incompatibility with the old Questgen library
original_spacy_load = spacy.load
def patched_spacy_load(*args, **kwargs):
    kwargs.pop('quiet', None)
    return original_spacy_load(*args, **kwargs)
spacy.load = patched_spacy_load

# Helper to ensure NLTK data is downloaded on startup
def download_nltk_package(package_name: str, package_type: str):
    try:
        nltk.data.find(f'{package_type}/{package_name}')
    except LookupError:
        nltk.download(package_name, quiet=True)

# Call the helper for all needed NLTK packages
download_nltk_package('stopwords', 'corpora')
download_nltk_package('punkt', 'tokenizers')

def get_all_sentences(text: str) -> list[str]:
    """
    Splits a block of text into sentences and filters them for quality.
    """
    sentences = nltk.sent_tokenize(text)
    good_sentences = []
    for sentence in sentences:
        # Filter for sentences that are a reasonable length and not questions
        if len(sentence.split()) > 8 and len(sentence.split()) < 100 and '?' not in sentence:
            good_sentences.append(sentence.strip())
    return good_sentences


class QuestgenService:
    def __init__(self):
        self.qgen = main.QGen()
        self.boolq = main.BoolQGen()
        self.answergen = main.AnswerPredictor()
        print("✅ Questgen models (QGen, BoolQGen, AnswerPredictor) loaded successfully.")

    def generate_questions(self, context: str, total_questions: int, question_distribution: dict):
        all_mcqs, all_bools, all_fillins = [], [], []

        # Use our helper to get a master list of high-quality sentences
        candidate_sentences = get_all_sentences(context)
        
        if not candidate_sentences:
            return {"questions": []}

        target_mcq = int(total_questions * question_distribution.get("mcq", 0))
        target_bool = int(total_questions * question_distribution.get("true_false", 0))
        target_fillin = int(total_questions * question_distribution.get("fill_in", 0))
        
        max_sentences_to_process = min(len(candidate_sentences), max(total_questions * 3, 15))
        sentences_to_process = candidate_sentences[:max_sentences_to_process]
        
        print(f"🔍 DEBUG: Processing {len(sentences_to_process)} sentences (out of {len(candidate_sentences)} available)")
        print(f"🎯 DEBUG: Target: {target_mcq} MCQs, {target_bool} Boolean, {target_fillin} Fill-in questions")
        print(f"📊 DEBUG: Distribution received: {question_distribution}")

        for i, sentence in enumerate(sentences_to_process):
            print(f"\n--- Processing sentence {i+1}: {sentence[:100]}...")
            
            if target_mcq > 0 and len(all_mcqs) < target_mcq * 3:
                try:
                    print(f"🔄 Attempting MCQ generation...")
                    mcq_payload = {"input_text": sentence}
                    mcq_result = self.qgen.predict_mcq(mcq_payload)
                    print(f"📝 MCQ result type: {type(mcq_result)}")
                    print(f"📝 MCQ result: {mcq_result}")
                    
                    if mcq_result and 'questions' in mcq_result:
                        for q in mcq_result['questions']:
                            q['question_type'] = 'mcq'
                        all_mcqs.extend(mcq_result['questions'])
                        print(f"✅ Generated {len(mcq_result['questions'])} MCQs from sentence {i+1}")
                    else:
                        print(f"❌ No MCQs generated from sentence {i+1}")
                except Exception as e:
                    print(f"💥 Error generating MCQs from sentence {i+1}: {e}")

            if target_bool > 0 and len(all_bools) < target_bool * 3:
                try:
                    print(f"🔄 Attempting Boolean question generation...")
                    bool_payload = {"input_text": sentence}
                    bool_result = self.boolq.predict_boolq(bool_payload)
                    print(f"📝 Boolean result type: {type(bool_result)}")
                    print(f"📝 Boolean result: {bool_result}")
                    
                    if bool_result and isinstance(bool_result, dict):
                        # Handle the format: {'Text': '...', 'Count': 4, 'Boolean Questions': ['question1', 'question2']}
                        if 'Boolean Questions' in bool_result and bool_result['Boolean Questions']:
                            boolean_questions = []
                            for question_text in bool_result['Boolean Questions']:
                                # Determine if question should be true or false based on content analysis
                                should_be_true = self._analyze_boolean_question(question_text, sentence)
                                
                                # Randomly decide if we want to keep the natural answer or flip it
                                if random.choice([True, False]):  # 50% chance to flip
                                    correct_answer = 'True' if should_be_true else 'False'
                                else:
                                    # Flip the question logic and answer
                                    question_text = self._flip_boolean_question(question_text)
                                    correct_answer = 'False' if should_be_true else 'True'
                                
                                # Create question object in the expected format
                                question_obj = {
                                    'question_statement': question_text,
                                    'question_type': 'true_false',
                                    'options': ['True', 'False'],
                                    'answer': correct_answer
                                }
                                boolean_questions.append(question_obj)
                            
                            all_bools.extend(boolean_questions)
                            print(f"✅ Generated {len(boolean_questions)} Boolean questions from sentence {i+1}")
                        else:
                            print(f"❌ No Boolean questions in result from sentence {i+1}")
                            print(f"🔍 Boolean result keys: {bool_result.keys() if bool_result else 'None'}")
                    else:
                        print(f"❌ Invalid Boolean result format from sentence {i+1}")
                        print(f"🔍 Boolean result keys: {bool_result.keys() if bool_result else 'None'}")
                except Exception as e:
                    print(f"💥 Error generating Boolean questions from sentence {i+1}: {e}")
                    import traceback
                    print(f"🔍 Full traceback: {traceback.format_exc()}")

            if target_fillin > 0 and len(all_fillins) < target_fillin * 3:
                try:
                    print(f"🔄 Attempting Fill-in question generation...")
                    fillin_payload = {"input_question": [sentence]}
                    fillin_result = self.answergen.predict_answer(fillin_payload)
                    print(f"📝 Fill-in result type: {type(fillin_result)}")
                    print(f"📝 Fill-in result: {fillin_result}")
                    
                    if fillin_result:
                        fillin_questions = []
                        
                        if isinstance(fillin_result, list):
                            print(f"🔍 Fill-in result is a list with {len(fillin_result)} items")
                            for item in fillin_result:
                                if isinstance(item, str):
                                    # Convert sentence to fill-in-the-blank format
                                    # Find important words to blank out
                                    words = item.split()
                                    if len(words) > 5:  # Only process sentences with enough words
                                        # Find nouns, adjectives, or important words to blank out
                                        important_words = []
                                        for word in words:
                                            # Simple heuristic: words longer than 4 characters that aren't common words
                                            if (len(word) > 4 and 
                                                word.lower() not in ['the', 'and', 'that', 'with', 'have', 'this', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were']):
                                                important_words.append(word)
                                        
                                        if important_words:
                                            # Pick a random important word to blank out
                                            word_to_blank = random.choice(important_words)
                                            answer = word_to_blank.strip('.,!?;:')
                                            question_text = item.replace(word_to_blank, '_____', 1)
                                            
                                            question_obj = {
                                                'question_statement': question_text,
                                                'question_type': 'fill_in',  # Changed from 'fill_in_blank' to 'fill_in'
                                                'options': [],
                                                'answer': answer
                                            }
                                            fillin_questions.append(question_obj)
                                            print(f"🔍 Created fill-in question: {question_text[:50]}... (Answer: {answer})")
                        
                        elif isinstance(fillin_result, dict):
                            # Format 1: {'sentences': [{'blanks_ques': [...]}]}
                            if 'sentences' in fillin_result and fillin_result['sentences']:
                                print(f"🔍 Found 'sentences' key with {len(fillin_result['sentences'])} items")
                                for sentence_data in fillin_result['sentences']:
                                    if isinstance(sentence_data, dict) and 'blanks_ques' in sentence_data:
                                        for blank_q in sentence_data['blanks_ques']:
                                            question_obj = {
                                                'question_statement': blank_q.get('question_statement', blank_q.get('question', str(blank_q))),
                                                'question_type': 'fill_in',  # Changed from 'fill_in_blank' to 'fill_in'
                                                'options': [],
                                                'answer': blank_q.get('answer', blank_q.get('ans', ''))
                                            }
                                            fillin_questions.append(question_obj)
                            
                            # Format 2: Direct list of questions
                            elif 'questions' in fillin_result:
                                for q in fillin_result['questions']:
                                    question_obj = {
                                        'question_statement': q.get('question_statement', q.get('question', str(q))),
                                        'question_type': 'fill_in',  # Changed from 'fill_in_blank' to 'fill_in'
                                        'options': [],
                                        'answer': q.get('answer', q.get('ans', ''))
                                    }
                                    fillin_questions.append(question_obj)
                        
                        if fillin_questions:
                            all_fillins.extend(fillin_questions)
                            print(f"✅ Generated {len(fillin_questions)} Fill-in questions from sentence {i+1}")
                        else:
                            print(f"❌ No Fill-in questions extracted from sentence {i+1}")
                    else:
                        print(f"❌ No Fill-in result from sentence {i+1}")
                        
                except Exception as e:
                    print(f"💥 Error generating Fill-in questions from sentence {i+1}: {e}")
                    import traceback
                    print(f"🔍 Full traceback: {traceback.format_exc()}")

            if len(all_mcqs) >= target_mcq * 2 and len(all_bools) >= target_bool * 2 and len(all_fillins) >= target_fillin * 2:
                print(f"⏹️ Early termination at sentence {i+1} - sufficient questions generated")
                break

        all_mcqs = list({q['question_statement']: q for q in all_mcqs}.values())
        all_bools = list({q['question_statement']: q for q in all_bools}.values())
        all_fillins = list({q['question_statement']: q for q in all_fillins}.values())
        random.shuffle(all_mcqs)
        random.shuffle(all_bools)
        random.shuffle(all_fillins)

        print(f"\n📊 After deduplication: {len(all_mcqs)} unique MCQs, {len(all_bools)} unique Boolean, {len(all_fillins)} unique Fill-in questions")

        final_questions = []
        selected_mcqs = all_mcqs[:target_mcq]
        selected_bools = all_bools[:target_bool]
        selected_fillins = all_fillins[:target_fillin]
        
        print(f"🎯 Selecting {len(selected_mcqs)} MCQs, {len(selected_bools)} Boolean, and {len(selected_fillins)} Fill-in questions")
        
        final_questions.extend(selected_mcqs)
        final_questions.extend(selected_bools)
        final_questions.extend(selected_fillins)

        # If we are still short of the total, fill the gap with any other available questions
        if len(final_questions) < total_questions:
            remaining_pool = (all_mcqs[target_mcq:] + all_bools[target_bool:] + all_fillins[target_fillin:])
            random.shuffle(remaining_pool)
            needed = total_questions - len(final_questions)
            final_questions.extend(remaining_pool[:needed])
            print(f"🔄 Added {needed} additional questions to reach target")

        random.shuffle(final_questions)

        print(f"\n🎉 Final result: {len(final_questions)} total questions")
        question_types = [q.get('question_type', 'unknown') for q in final_questions]
        type_counts = {t: question_types.count(t) for t in set(question_types)}
        print(f"📊 Question type breakdown: {type_counts}")
        
        # Return a dictionary with the final list of questions, enforcing the total count
        return {"questions": final_questions[:total_questions]}

    def _analyze_boolean_question(self, question: str, context: str) -> bool:
        """
        Analyze a boolean question to determine if it should naturally be true or false
        based on the context sentence.
        """
        question_lower = question.lower()
        context_lower = context.lower()
        
        # Check for negative words that might indicate a false statement
        negative_indicators = ['not', 'never', 'no', 'cannot', 'isn\'t', 'aren\'t', 'doesn\'t', 'don\'t', 'won\'t', 'wouldn\'t', 'shouldn\'t', 'couldn\'t']
        
        # If question contains negative words, it might be testing a false statement
        if any(neg in question_lower for neg in negative_indicators):
            return False
        
        # Check if key terms from the question appear in the context
        # Remove common words and check for overlap
        common_words = {'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        question_words = set(question_lower.replace('?', '').split()) - common_words
        context_words = set(context_lower.split()) - common_words
        
        # If there's good overlap between question and context, likely true
        overlap = len(question_words.intersection(context_words))
        return overlap >= 2  # At least 2 meaningful words should match
    
    def _flip_boolean_question(self, question: str) -> str:
        """
        Flip a boolean question to its opposite meaning.
        """
        question_lower = question.lower()
        
        # Simple flipping strategies
        if question_lower.startswith('is '):
            return question.replace('Is ', 'Is not ', 1).replace('is ', 'is not ', 1)
        elif question_lower.startswith('are '):
            return question.replace('Are ', 'Are not ', 1).replace('are ', 'are not ', 1)
        elif question_lower.startswith('does '):
            return question.replace('Does ', 'Does not ', 1).replace('does ', 'does not ', 1)
        elif question_lower.startswith('do '):
            return question.replace('Do ', 'Do not ', 1).replace('do ', 'do not ', 1)
        elif question_lower.startswith('can '):
            return question.replace('Can ', 'Cannot ', 1).replace('can ', 'cannot ', 1)
        elif question_lower.startswith('will '):
            return question.replace('Will ', 'Will not ', 1).replace('will ', 'will not ', 1)
        elif ' is ' in question_lower:
            return question.replace(' is ', ' is not ', 1)
        elif ' are ' in question_lower:
            return question.replace(' are ', ' are not ', 1)
        else:
            # If we can't flip it easily, add "not" before the main verb
            return f"Is it not true that {question.lower().replace('?', '')}?"

# Create the singleton instance for the entire application to use
questgen_instance = QuestgenService()
