import fitz  # PyMuPDF
import docx
import io
from typing import Optional, Tuple, Dict, Any
from fastapi import UploadFile, HTTPException
from ..services.summarizer import Summarizer

class FileParser:
    def __init__(self):
        self.summarizer = Summarizer()
        self.supported_types = {
            'application/pdf': self._parse_pdf,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': self._parse_docx,
            'text/plain': self._parse_text,
            'application/msword': self._parse_legacy_doc
        }

    async def parse_file(
        self,
        file: UploadFile,
        summarize_large_files: bool = True,
        page_threshold: int = 5
    ) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        """
        Main entry point that handles all file types
        Returns tuple of (extracted_text, metadata)
        """
        if file.content_type not in self.supported_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}. Supported types: {list(self.supported_types.keys())}"
            )

        try:
            # Read file content once
            file_content = await file.read()
            file_stream = io.BytesIO(file_content)
            
            # Get parser function and process file
            parser = self.supported_types[file.content_type]
            text, metadata = parser(file_stream)
            
            if not text:
                raise ValueError("No text could be extracted from file")
            
            # Handle summarization for large PDFs
            if (summarize_large_files and 
                file.content_type == 'application/pdf' and 
                metadata.get('page_count', 0) > page_threshold):
                text = self.summarizer.summarize(text)
                metadata['was_summarized'] = True
                metadata['post_summary_length'] = len(text.split())
            
            return text, metadata
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing file: {str(e)}"
            )

    def _parse_pdf(self, file_stream: io.BytesIO) -> Tuple[str, Dict[str, Any]]:
        """Handle PDF files with PyMuPDF"""
        text = ""
        metadata = {'type': 'pdf', 'page_count': 0}
        
        try:
            file_stream.seek(0)
            with fitz.open(stream=file_stream.read(), filetype="pdf") as doc:
                metadata['page_count'] = len(doc)
                for page in doc:
                    text += page.get_text("text") + "\n"
        except Exception as e:
            raise ValueError(f"PDF parsing failed: {str(e)}")
        
        metadata['original_length'] = len(text.split())
        return text.strip(), metadata

    def _parse_docx(self, file_stream: io.BytesIO) -> Tuple[str, Dict[str, Any]]:
        """Handle modern Word documents"""
        text = ""
        metadata = {'type': 'docx'}
        
        try:
            file_stream.seek(0)
            doc = docx.Document(file_stream)
            text = "\n".join(
                para.text for para in doc.paragraphs if para.text.strip()
            )
        except Exception as e:
            raise ValueError(f"DOCX parsing failed: {str(e)}")
        
        metadata['original_length'] = len(text.split())
        return text.strip(), metadata

    def _parse_legacy_doc(self, file_stream: io.BytesIO) -> Tuple[str, Dict[str, Any]]:
        """Handle legacy .doc files (requires text conversion)"""
        # Note: This requires antiword or similar to be installed
        # For simplicity, we'll just raise here but could implement
        raise ValueError("Legacy .doc files require conversion to .docx first")

    def _parse_text(self, file_stream: io.BytesIO) -> Tuple[str, Dict[str, Any]]:
        """Handle plain text files"""
        try:
            file_stream.seek(0)
            text = file_stream.read().decode('utf-8')
            return text.strip(), {
                'type': 'text',
                'original_length': len(text.split())
            }
        except Exception as e:
            raise ValueError(f"Text file parsing failed: {str(e)}")