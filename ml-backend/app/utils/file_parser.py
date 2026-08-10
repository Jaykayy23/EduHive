import asyncio
import io
import multiprocessing
import os
import zipfile
from typing import Any

import docx
from fastapi import HTTPException, UploadFile
from pypdf import PdfReader

from ..services.summarizer import Summarizer


def _apply_worker_resource_limits(memory_limit_mb: int, cpu_seconds: int) -> None:
    """Apply hard limits in Linux containers; Windows still gets hard termination."""
    try:
        import resource

        memory_bytes = memory_limit_mb * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
        resource.setrlimit(
            resource.RLIMIT_CPU,
            (max(1, cpu_seconds), max(2, cpu_seconds + 1)),
        )
    except (ImportError, OSError, ValueError):
        # The parent process always enforces a wall-clock deadline even when
        # platform resource limits are unavailable.
        return


def _parse_document_worker(
    sender: Any,
    file_content: bytes,
    detected_type: str,
    limits: dict[str, int],
) -> None:
    """Parse one untrusted document in a disposable child process."""
    try:
        _apply_worker_resource_limits(
            limits["memory_limit_mb"],
            limits["timeout_seconds"],
        )
        parser = FileParser()
        parser.max_extracted_chars = limits["max_extracted_chars"]
        parser.max_pdf_pages = limits["max_pdf_pages"]
        parser.max_docx_entries = limits["max_docx_entries"]
        parser.max_docx_uncompressed_bytes = limits["max_docx_uncompressed_bytes"]
        result = parser.supported_types[detected_type](io.BytesIO(file_content))
        sender.send(("ok", result))
    except ValueError as exc:
        sender.send(("validation_error", str(exc)))
    except BaseException:
        sender.send(("processing_error", "The document could not be processed"))
    finally:
        sender.close()


class FileParser:
    def __init__(self):
        self.max_upload_bytes = int(os.getenv("MAX_UPLOAD_MB", "10")) * 1024 * 1024
        self.max_extracted_chars = int(os.getenv("MAX_CONTEXT_CHARS", "60000"))
        self.max_pdf_pages = int(os.getenv("MAX_PDF_PAGES", "100"))
        self.max_docx_entries = int(os.getenv("MAX_DOCX_ENTRIES", "1000"))
        self.max_docx_uncompressed_bytes = (
            int(os.getenv("MAX_DOCX_UNCOMPRESSED_MB", "40")) * 1024 * 1024
        )
        self.parse_timeout_seconds = int(os.getenv("FILE_PARSE_TIMEOUT_SECONDS", "15"))
        self.parse_memory_limit_mb = int(os.getenv("FILE_PARSE_MEMORY_LIMIT_MB", "256"))
        self._parse_slots = asyncio.Semaphore(
            max(1, int(os.getenv("MAX_CONCURRENT_FILE_PARSES", "2")))
        )
        self.summarizer = Summarizer(max_words=int(os.getenv("SUMMARY_MAX_WORDS", "3500")))
        self.supported_types = {
            'application/pdf': self._parse_pdf,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': self._parse_docx,
            'text/plain': self._parse_text,
        }

    async def parse_file(
        self,
        file: UploadFile,
        summarize_large_files: bool = True,
        page_threshold: int = 5
    ) -> tuple[str, dict[str, Any]]:
        """
        Main entry point that handles all file types
        Returns tuple of (extracted_text, metadata)
        """
        try:
            file_content = await file.read(self.max_upload_bytes + 1)
            if len(file_content) > self.max_upload_bytes:
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds the {self.max_upload_bytes // (1024 * 1024)} MB upload limit",
                )
            detected_type = self._detect_type(file_content)
            declared_type = (file.content_type or "").lower()
            if declared_type not in {detected_type, "application/octet-stream", ""}:
                raise HTTPException(
                    status_code=400,
                    detail="The file contents do not match the declared file type",
                )

            async with self._parse_slots:
                try:
                    text, metadata = await asyncio.to_thread(
                        self._parse_isolated,
                        file_content,
                        detected_type,
                    )
                except TimeoutError as exc:
                    raise HTTPException(
                        status_code=408,
                        detail="The document took too long to process",
                    ) from exc
            
            if not text:
                raise ValueError("No text could be extracted from file")
            
            # Handle summarization for large PDFs
            if (summarize_large_files and 
                detected_type == 'application/pdf' and
                metadata.get('page_count', 0) > page_threshold):
                text = self.summarizer.summarize(text)
                metadata['was_summarized'] = True
                metadata['post_summary_length'] = len(text.split())
            
            return text, metadata
            
        except HTTPException:
            raise
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail="The document could not be processed",
            ) from exc

    def _parse_isolated(
        self,
        file_content: bytes,
        detected_type: str,
    ) -> tuple[str, dict[str, Any]]:
        context = multiprocessing.get_context("spawn")
        receiver, sender = context.Pipe(duplex=False)
        limits = {
            "memory_limit_mb": self.parse_memory_limit_mb,
            "timeout_seconds": self.parse_timeout_seconds,
            "max_extracted_chars": self.max_extracted_chars,
            "max_pdf_pages": self.max_pdf_pages,
            "max_docx_entries": self.max_docx_entries,
            "max_docx_uncompressed_bytes": self.max_docx_uncompressed_bytes,
        }
        process = context.Process(
            target=_parse_document_worker,
            args=(sender, file_content, detected_type, limits),
            daemon=True,
        )
        process.start()
        sender.close()

        try:
            if not receiver.poll(self.parse_timeout_seconds):
                raise TimeoutError("Document parsing timed out")
            try:
                status, payload = receiver.recv()
            except EOFError as exc:
                raise ValueError("The document parser stopped unexpectedly") from exc

            if status == "ok":
                return payload
            if status == "validation_error":
                raise ValueError(payload)
            raise ValueError("The document could not be processed")
        finally:
            receiver.close()
            process.join(timeout=0.5)
            if process.is_alive():
                process.terminate()
                process.join(timeout=1)
            if process.is_alive():
                process.kill()
                process.join(timeout=1)

    def _detect_type(self, file_content: bytes) -> str:
        """Identify the parser from file bytes instead of trusting client MIME data."""
        if file_content[:1024].lstrip().startswith(b"%PDF-"):
            return "application/pdf"

        stream = io.BytesIO(file_content)
        if zipfile.is_zipfile(stream):
            try:
                with zipfile.ZipFile(stream) as archive:
                    names = set(archive.namelist())
            except zipfile.BadZipFile as exc:
                raise ValueError("The uploaded document is not a valid DOCX file") from exc
            if {"[Content_Types].xml", "word/document.xml"}.issubset(names):
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            raise ValueError("Only DOCX ZIP documents are supported")

        try:
            decoded = file_content.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError("Only PDF, DOCX, and UTF-8 text files are supported") from exc
        if "\x00" in decoded:
            raise ValueError("Binary files are not supported")
        return "text/plain"

    def _ensure_text_limit(self, length: int) -> None:
        if length > self.max_extracted_chars:
            raise ValueError(
                f"Extracted text exceeds the {self.max_extracted_chars:,}-character limit"
            )

    def _parse_pdf(self, file_stream: io.BytesIO) -> tuple[str, dict[str, Any]]:
        """Extract text from a PDF with the small, pure-Python pypdf package."""
        metadata = {'type': 'pdf', 'page_count': 0}

        try:
            file_stream.seek(0)
            reader = PdfReader(file_stream)
            if reader.is_encrypted:
                raise ValueError("Password-protected PDFs are not supported")
            metadata['page_count'] = len(reader.pages)
            if metadata['page_count'] > self.max_pdf_pages:
                raise ValueError(
                    f"PDF exceeds the {self.max_pdf_pages}-page processing limit"
                )

            parts: list[str] = []
            extracted_chars = 0
            for page in reader.pages:
                page_text = page.extract_text() or ""
                extracted_chars += len(page_text)
                self._ensure_text_limit(extracted_chars)
                parts.append(page_text)
            text = "\n".join(parts)
        except ValueError:
            raise
        except Exception as exc:
            raise ValueError("The PDF could not be parsed") from exc
        
        metadata['original_length'] = len(text.split())
        return text.strip(), metadata

    def _parse_docx(self, file_stream: io.BytesIO) -> tuple[str, dict[str, Any]]:
        """Handle modern Word documents"""
        text = ""
        metadata = {'type': 'docx'}
        
        try:
            file_stream.seek(0)
            with zipfile.ZipFile(file_stream) as archive:
                entries = archive.infolist()
                if len(entries) > self.max_docx_entries:
                    raise ValueError("DOCX contains too many archive entries")
                if any(entry.flag_bits & 0x1 for entry in entries):
                    raise ValueError("Encrypted DOCX files are not supported")

                expanded_size = sum(entry.file_size for entry in entries)
                if expanded_size > self.max_docx_uncompressed_bytes:
                    raise ValueError("DOCX expands beyond the processing limit")

                compressed_size = sum(max(entry.compress_size, 1) for entry in entries)
                if expanded_size > compressed_size * 100:
                    raise ValueError("DOCX compression ratio exceeds the processing limit")

            file_stream.seek(0)
            doc = docx.Document(file_stream)
            parts: list[str] = []
            extracted_chars = 0
            for paragraph in doc.paragraphs:
                if not paragraph.text.strip():
                    continue
                extracted_chars += len(paragraph.text)
                self._ensure_text_limit(extracted_chars)
                parts.append(paragraph.text)
            text = "\n".join(parts)
        except ValueError:
            raise
        except (zipfile.BadZipFile, KeyError) as exc:
            raise ValueError("The DOCX file could not be parsed") from exc
        except Exception as exc:
            raise ValueError("The DOCX file could not be parsed") from exc
        
        metadata['original_length'] = len(text.split())
        return text.strip(), metadata

    def _parse_text(self, file_stream: io.BytesIO) -> tuple[str, dict[str, Any]]:
        """Handle plain text files"""
        try:
            file_stream.seek(0)
            text = file_stream.read().decode('utf-8')
            self._ensure_text_limit(len(text))
            return text.strip(), {
                'type': 'text',
                'original_length': len(text.split())
            }
        except ValueError:
            raise
        except UnicodeDecodeError as exc:
            raise ValueError("The text file must use UTF-8 encoding") from exc
        except Exception as exc:
            raise ValueError("The text file could not be parsed") from exc
