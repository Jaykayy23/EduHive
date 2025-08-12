from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

# Import all our custom modules
from .utils.file_parser import parse_file
from .services.text_cleaning_service import gemini_cleaner_instance
from .services.questgen_service import questgen_instance
from .models import GeneratedQuestionsResponse, TextGenerationRequest

# Initialize the FastAPI app with a title for the docs
app = FastAPI(title="EduHive Questgen AI Backend")

# Standard CORS setup to allow your frontend to connect
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This async helper function contains the core AI pipeline logic
async def process_and_generate(context: str, total_questions: int, distribution: dict):
    """
    The core AI pipeline: cleans text with Google Gemini, then generates questions with Questgen.
    """
    try:
        # STEP 1: Clean the raw text using the powerful Google Gemini model.
        print("Step 1: Cleaning text with Google Gemini...")
        cleaned_context = await gemini_cleaner_instance.clean_text_with_llm(context)
        print("Step 2: Text cleaned. Generating questions with Questgen...")

        # STEP 2: Feed the super-clean text to our Questgen service.
        payload = questgen_instance.generate_questions(
            context=cleaned_context,
            total_questions=total_questions,
            question_distribution=distribution
        )
        
        # Add the original source text back into the final payload for the user
        payload['source_text'] = context
        
        if not payload['questions']:
            raise HTTPException(
                status_code=404, 
                detail="Could not generate any questions from the provided text, even after AI cleaning."
            )
            
        print("Step 3: Question generation complete.")
        return payload

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred during the pipeline: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred during AI processing.")


@app.post("/generate-from-text/", response_model=GeneratedQuestionsResponse, tags=["Question Generation"])
async def create_questions_from_text(request: TextGenerationRequest):
    if len(request.text_input) < 150:
        raise HTTPException(status_code=400, detail="Input text is too short.")
    distribution = {
        "mcq": request.mcq_percentage,
        "true_false": request.true_false_percentage,
        "fill_in": request.fill_in_percentage
    }
    return await process_and_generate(
        context=request.text_input, 
        total_questions=request.total_questions, 
        distribution=distribution
    )


@app.post("/generate-from-file/", response_model=GeneratedQuestionsResponse, tags=["Question Generation"])
async def create_questions_from_file(
    file: UploadFile = File(...),
    total_questions: int = Form(10),
    question_distribution_json: str = Form('{"mcq": 0.5, "true_false": 0.5, "fill_in": 0.0}')
):
    context = await parse_file(file)
    if not context:
        raise HTTPException(status_code=400, detail="Could not parse file.")
    if len(context) < 150:
        raise HTTPException(status_code=400, detail="Text from file is too short.")
    try:
        distribution = json.loads(question_distribution_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON for distribution.")
    return await process_and_generate(
        context=context, 
        total_questions=total_questions, 
        distribution=distribution
    )


@app.get("/", tags=["Health Check"])
def read_root():
    return {"message": "Questgen ML Backend with Google Gemini Cleaning is running."}