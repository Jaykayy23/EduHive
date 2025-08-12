import fitz  # PyMuPDF is imported as fitz
import docx
from fastapi import UploadFile
from typing import IO

def extract_text_from_pdf(file_stream: IO) -> str:
    """
    Extracts text from a PDF file stream using the superior PyMuPDF library.
    This method is much better at preserving paragraphs and reading order.
    """
    text = ""
    try:
        # PyMuPDF opens the file stream directly
        with fitz.open(stream=file_stream.read(), filetype="pdf") as doc:
            for page in doc:
                # The 'get_text()' method is highly effective
                text += page.get_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF with PyMuPDF: {e}")
        return ""
    return text

def extract_text_from_docx(file_stream: IO) -> str:
    """Extracts text from a DOCX file stream (this function remains the same)."""
    text = ""
    try:
        doc = docx.Document(file_stream)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""
    return text

async def parse_file(file: UploadFile) -> str:
    """
    Asynchronously determines the file type and calls the appropriate
    text extraction function.
    """
    content_type = file.content_type
    file_stream = file.file

    if content_type == "application/pdf":
        return extract_text_from_pdf(file_stream)
    elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return extract_text_from_docx(file_stream)
    elif "text" in content_type:
        file_bytes = await file.read()
        return file_bytes.decode("utf-8")
    else:
        print(f"Unsupported file type: {content_type}")
        return ""