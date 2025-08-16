from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from io import BytesIO

# Import services and utilities
from .services.pdf_text_cleaner import PDFTextCleaner, ProcessingMode
from .services.questgen_service import questgen_instance
from .utils.file_parser import FileParser  # Updated import
from .models import GeneratedQuestionsResponse, TextGenerationRequest

# Initialize services
app = FastAPI(title="EduHive Questgen AI Backend")
file_parser = FileParser()  # Initialize the enhanced file parser

pdf_cleaner = PDFTextCleaner({
    "processing_mode": ProcessingMode.ACADEMIC,
    "diagnostic_mode": True,
    "remove_citations": True,
    "sentence_chunking": True
})

# CORS configuration
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def process_and_generate(
    context: str,
    total_questions: int,
    distribution: dict,
    file_metadata: dict = None
) -> GeneratedQuestionsResponse:
    """
    Enhanced processing pipeline:
    1. Clean text with PDFTextCleaner
    2. Generate questions with Questgen
    3. Include comprehensive metadata
    """
    try:
        # STEP 1: Clean the text
        print("Step 1: Cleaning text with PDFTextCleaner...")
        cleaned_context, diagnostics = pdf_cleaner.clean_text(context)
        
        # Include file metadata if available
        if file_metadata:
            diagnostics.file_metadata = file_metadata
            if file_metadata.get('was_summarized', False):
                print(f"Used summarized content from {file_metadata['page_count']} page document")

        # STEP 2: Generate questions
        print("Step 2: Generating questions...")
        payload = questgen_instance.generate_questions(
            context=cleaned_context,
            total_questions=total_questions,
            question_distribution=distribution
        )

        # Prepare diagnostics
        diagnostics_data = {
            'original_length': diagnostics.original_length,
            'cleaned_length': diagnostics.cleaned_length,
            'headers_removed': diagnostics.removed_headers,
            'citations_removed': diagnostics.removed_citations,
            'equations_preserved': diagnostics.equations_preserved,
            'reading_time_min': diagnostics.reading_time_min,
            'avg_sentence_length': diagnostics.avg_sentence_length,
            **({'file_metadata': file_metadata} if file_metadata else {})
        }

        payload.update({
            'source_text': context[:1000] + "..." if len(context) > 1000 else context,
            'cleaning_diagnostics': diagnostics_data
        })

        if not payload['questions']:
            raise HTTPException(
                status_code=404, 
                detail="No questions could be generated from the provided text."
            )

        print("Step 3: Pipeline complete")
        return GeneratedQuestionsResponse(**payload)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Pipeline error: {str(e)}")
        raise HTTPException(status_code=500, detail="Processing failed")

@app.post("/generate-from-text/", response_model=GeneratedQuestionsResponse, tags=["Question Generation"])
async def create_questions_from_text(request: TextGenerationRequest):
    """Endpoint for direct text input"""
    if len(request.text_input) < 150:
        raise HTTPException(status_code=400, detail="Input text too short (min 150 chars)")
    
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
    question_distribution_json: str = Form('{"mcq": 0.5, "true_false": 0.5, "fill_in": 0.0}'),
    summarize_large_files: bool = Form(True),
    page_threshold: int = Form(5)
):
    """Enhanced file processing endpoint"""
    try:
        # Parse distribution
        distribution = json.loads(question_distribution_json)
        if abs(sum(distribution.values()) - 1.0) > 0.001:  # Account for floating point precision
            raise ValueError("Question distribution must sum to 1.0")

        # Process file (includes optional summarization)
        text, file_metadata = await file_parser.parse_file(
            file,
            summarize_large_files=summarize_large_files,
            page_threshold=page_threshold
        )
        
        if not text or len(text) < 150:
            raise ValueError("Text from file is too short or could not be extracted")

        return await process_and_generate(
            context=text,
            total_questions=total_questions,
            distribution=distribution,
            file_metadata=file_metadata
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid distribution format")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

@app.get("/", tags=["Health Check"])
def health_check():
    return {
        "status": "running",
        "features": {
            "file_support": list(file_parser.supported_types.keys()),
            "max_page_threshold": 50  # Document your limits
        }
    }

@app.get("/health", tags=["Health Check"])
def health_check_render():
    """Health check endpoint specifically for Render deployment"""
    return {
        "status": "healthy",
        "message": "ML Backend is running",
        "service": "eduhive-questgen-backend",
        "version": "1.0.0"
    }