from transformers import pipeline
import torch
from pypdf import PdfReader
from io import BytesIO

class Summarizer:
    def __init__(self):
        self.model = None
        self.max_input_length = 1024  # BART's token limit
        
    def load_model(self):
        """Lazy-load model to save memory"""
        if not self.model:
            self.model = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=0 if torch.cuda.is_available() else -1
            )
    
    def get_page_count(self, file_content: bytes) -> int:
        """Get exact page count from PDF file content"""
        try:
            with BytesIO(file_content) as pdf_file:
                reader = PdfReader(pdf_file)
                return len(reader.pages)
        except Exception as e:
            print(f"Error counting PDF pages: {e}")
            return 0
    
    def _estimate_tokens(self, text: str) -> int:
        """More accurate token estimation for BART"""
        # BART tokenizer typically produces more tokens than simple word splitting
        # Use a more conservative estimate: ~2.5 chars per token
        return len(text) // 2.5
    
    def _truncate_text(self, text: str) -> str:
        """Truncate text to fit within BART's token limits"""
        if not self.model:
            self.load_model()
        
        # Use the actual tokenizer to check length
        try:
            # Get the tokenizer from the pipeline
            tokenizer = self.model.tokenizer
            
            # Tokenize and check actual length
            tokens = tokenizer.encode(text, add_special_tokens=True)
            
            if len(tokens) <= self.max_input_length:
                return text
            
            # Binary search to find the right length
            left, right = 0, len(text)
            best_text = text[:self.max_input_length * 2]  # Conservative start
            
            while left < right:
                mid = (left + right + 1) // 2
                candidate = text[:mid]
                
                try:
                    candidate_tokens = tokenizer.encode(candidate, add_special_tokens=True)
                    if len(candidate_tokens) <= self.max_input_length:
                        best_text = candidate
                        left = mid
                    else:
                        right = mid - 1
                except:
                    right = mid - 1
            
            # Try to end at sentence boundary
            truncated = best_text
            last_period = truncated.rfind('.')
            last_newline = truncated.rfind('\n')
            
            # Use sentence boundary if it's in the last 20% of the text
            if last_period > len(truncated) * 0.8:
                final_text = truncated[:last_period + 1]
                # Verify final text still fits
                final_tokens = tokenizer.encode(final_text, add_special_tokens=True)
                if len(final_tokens) <= self.max_input_length:
                    return final_text
            elif last_newline > len(truncated) * 0.8:
                final_text = truncated[:last_newline]
                final_tokens = tokenizer.encode(final_text, add_special_tokens=True)
                if len(final_tokens) <= self.max_input_length:
                    return final_text
            
            return truncated
            
        except Exception as e:
            print(f"Error in truncation, using fallback: {e}")
            # Fallback to conservative character-based truncation
            max_chars = self.max_input_length * 2  # Very conservative
            return text[:max_chars]
    
    def summarize(self, text: str) -> str:
        if not text or not text.strip():
            return ""
            
        if not self.model:
            self.load_model()
        
        # Truncate text to fit BART's limits
        processed_text = self._truncate_text(text)
        
        # Debug: Check actual token count after truncation
        try:
            tokenizer = self.model.tokenizer
            actual_tokens = tokenizer.encode(processed_text, add_special_tokens=True)
            print(f"After truncation: {len(actual_tokens)} tokens (limit: {self.max_input_length})")
        except Exception as e:
            print(f"Could not verify token count: {e}")
        
        # Ensure we have enough content to summarize
        word_count = len(processed_text.split())
        if word_count < 10:
            print(f"Text too short for summarization ({word_count} words), returning original")
            return processed_text
        
        try:
            # Adjust summary length based on processed text length
            max_summary_length = min(1200, max(100, int(word_count * 0.3)))  # At least 100 tokens
            min_summary_length = min(max_summary_length - 50, max(30, int(word_count * 0.1)))  # Ensure min < max
            
            print(f"Summarizing {word_count} words, target length: {min_summary_length}-{max_summary_length}")
            
            result = self.model(
                processed_text,
                max_length=max_summary_length,
                min_length=min_summary_length,
                do_sample=False
            )
            
            # Better error handling for result structure
            if isinstance(result, list) and len(result) > 0:
                if isinstance(result[0], dict) and 'summary_text' in result[0]:
                    print("✅ Summarization successful")
                    return result[0]['summary_text']
                else:
                    print(f"Unexpected result structure: {result}")
                    return self._fallback_summary(processed_text)
            else:
                print(f"Empty or invalid result: {result}")
                return self._fallback_summary(processed_text)
            
        except Exception as e:
            print(f"Summarization failed: {e}")
            return self._fallback_summary(processed_text)
    
    def _fallback_summary(self, text: str) -> str:
        """Create a fallback summary when model fails"""
        sentences = text.split('. ')
        
        # Return first few sentences, but ensure we have enough content
        if len(sentences) >= 5:
            return '. '.join(sentences[:5]) + '.'
        elif len(sentences) >= 3:
            return '. '.join(sentences[:3]) + '.'
        elif len(text) > 1000:
            # If we have long text but few sentences, take first portion
            return text[:1000] + "..."
        else:
            return text
    
    def chunk_and_summarize(self, text: str) -> str:
        """
        Alternative method to process very long texts by chunking
        Use this if you want to process the entire document
        """
        if not text or not text.strip():
            return ""
        
        # If text is short enough, use regular summarize
        if self._estimate_tokens(text) <= self.max_input_length:
            return self.summarize(text)
        
        # Split into chunks
        max_chars_per_chunk = self.max_input_length * 3  # Conservative estimate
        chunks = []
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        current_chunk = []
        current_length = 0
        
        for paragraph in paragraphs:
            paragraph_length = len(paragraph)
            
            if current_length + paragraph_length <= max_chars_per_chunk:
                current_chunk.append(paragraph)
                current_length += paragraph_length
            else:
                # Save current chunk
                if current_chunk:
                    chunks.append('\n\n'.join(current_chunk))
                
                # Start new chunk
                if paragraph_length <= max_chars_per_chunk:
                    current_chunk = [paragraph]
                    current_length = paragraph_length
                else:
                    # Split long paragraph
                    chunks.append(paragraph[:max_chars_per_chunk])
                    current_chunk = []
                    current_length = 0
        
        # Add remaining chunk
        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))
        
        # Summarize each chunk
        summaries = []
        for i, chunk in enumerate(chunks):
            try:
                summary = self.summarize(chunk)
                if summary:
                    summaries.append(summary)
            except Exception as e:
                print(f"Failed to summarize chunk {i+1}: {e}")
                # Use first part of chunk as fallback
                sentences = chunk.split('. ')
                if len(sentences) > 2:
                    summaries.append('. '.join(sentences[:2]) + '.')
        
        # Combine summaries
        combined_summary = '\n\n'.join(summaries)
        
        # If combined summary is still too long, summarize it again
        if self._estimate_tokens(combined_summary) > self.max_input_length:
            return self.summarize(combined_summary)
        
        return combined_summary