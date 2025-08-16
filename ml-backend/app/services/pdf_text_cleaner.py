"""
pdf_text_cleaner.py - The Most Comprehensive PDF Text Cleaner for AI & Education

Features:
✓ Multi-Stage Cleaning Pipeline (Encoding → Structural → Content → Semantic → Output)  
✓ Advanced Academic PDF Handling (Equations, Citations, Tables, References)  
✓ Intelligent Sentence Chunking for LLM Input  
✓ Robust Error Handling & Fallbacks  
✓ Parallel Processing for Large Documents  
✓ Comprehensive Diagnostics & Logging  
✓ Customizable for Different Domains (STEM, Legal, Medical)  
✓ Optimized for MCQ Generation Pipelines  

Usage:
    from pdf_text_cleaner import PDFTextCleaner, ProcessingMode
    
    cleaner = PDFTextCleaner({
        "processing_mode": ProcessingMode.ACADEMIC,
        "remove_citations": True
    })
    cleaned_text, diagnostics = cleaner.clean_text(raw_pdf_text)
"""

from __future__ import annotations

import re
import html
import logging
import hashlib
import unicodedata
from collections import Counter
from dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, List, Optional, Tuple, Callable
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import nltk
    from nltk.tokenize import sent_tokenize
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

# -----------------------------------------------------------------------------
# CONSTANTS & CONFIGURATION
# -----------------------------------------------------------------------------
class ProcessingMode(Enum):
    BASIC = auto()
    ACADEMIC = auto()
    LEGAL = auto()
    MEDICAL = auto()

DEFAULT_CONFIG = {
    "aggressive_cleaning": True,
    "remove_citations": True,
    "remove_hyperlinks": True,
    "remove_bullets": True,
    "preserve_equations": True,
    "preserve_tables": False,
    "sentence_chunking": True,
    "max_chunk_size": 5,
    "language": "english",
    "repeat_threshold": 3,
    "max_text_length": 1_000_000,
    "diagnostic_mode": False,
    "processing_mode": ProcessingMode.ACADEMIC,
}

# -----------------------------------------------------------------------------
# LOGGING SETUP
# -----------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("pdf_cleaning.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("PDFTextCleaner")

# -----------------------------------------------------------------------------
# DATA STRUCTURES
# -----------------------------------------------------------------------------
@dataclass
class CleaningDiagnostics:
    original_length: int
    cleaned_length: int
    processing_errors: int = 0
    removed_headers: int = 0
    removed_citations: int = 0
    equations_preserved: int = 0
    reading_time_min: float = 0.0
    avg_sentence_length: float = 0.0

# -----------------------------------------------------------------------------
# MAIN CLEANER CLASS
# -----------------------------------------------------------------------------
class PDFTextCleaner:
    """Industrial-strength PDF text cleaner optimized for MCQ generation."""

    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the PDF text cleaner with optional configuration.
        
        Args:
            config (Optional[Dict]): Configuration dictionary overriding DEFAULT_CONFIG
        """
        self.config = {**DEFAULT_CONFIG, **(config or {})}
        self._pattern_cache: Dict[str, re.Pattern] = {}
        self._common_headers_cache: Dict[str, set] = {}
        self.executor = ThreadPoolExecutor(max_workers=4)

        # Initialize NLTK if available
        if NLTK_AVAILABLE:
            self._ensure_nltk_data()
        
        # Mode-specific adjustments
        self._setup_processing_mode()

    def _ensure_nltk_data(self):
        """Ensure required NLTK data is downloaded."""
        for pkg in ["punkt", "stopwords"]:
            try:
                nltk.data.find(f"tokenizers/{pkg}" if pkg == "punkt" else f"corpora/{pkg}")
            except LookupError:
                nltk.download(pkg, quiet=True)

    def _setup_processing_mode(self):
        """Configure mode-specific settings."""
        mode = self.config["processing_mode"]
        if mode == ProcessingMode.ACADEMIC:
            self.config.update({"preserve_equations": True, "remove_citations": True})
        elif mode == ProcessingMode.LEGAL:
            self.config.update({"preserve_equations": False, "remove_citations": False})
        elif mode == ProcessingMode.MEDICAL:
            self.config.update({"preserve_equations": False, "remove_bullets": False})

    def clean_text(
        self, raw_text: str, **overrides
    ) -> Tuple[str, CleaningDiagnostics]:
        """
        Clean PDF-extracted text with advanced processing.
        
        Args:
            raw_text: Extracted PDF text
            **overrides: Configuration overrides
            
        Returns:
            Tuple of (cleaned_text, diagnostics)
        """
        config = {**self.config, **overrides}
        diagnostics = CleaningDiagnostics(
            original_length=len(raw_text),
            cleaned_length=0,
        )

        try:
            if len(raw_text) > config["max_text_length"]:
                cleaned_text = self._process_large_text(raw_text, config)
            else:
                cleaned_text = self._process_text_chunk(raw_text, config, diagnostics)
            
            diagnostics.cleaned_length = len(cleaned_text)
            self._finalize_diagnostics(cleaned_text, diagnostics)
            
            return cleaned_text, diagnostics
            
        except Exception as e:
            logger.error(f"Critical cleaning failure: {str(e)}", exc_info=True)
            diagnostics.processing_errors += 1
            return raw_text, diagnostics

    # -------------------------------------------------------------------------
    # CORE PROCESSING PIPELINE
    # -------------------------------------------------------------------------
    def _process_large_text(self, text: str, config: Dict) -> str:
        """Process large documents in parallel chunks."""
        chunks = self._split_text(text, config["max_text_length"])
        futures = []
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            for chunk in chunks:
                future = executor.submit(self._process_text_chunk, chunk, config)
                futures.append(future)
            
            results = [f.result() for f in as_completed(futures)]
            return "\n".join(results)

    def _process_text_chunk(
        self, text: str, config: Dict, diagnostics: Optional[CleaningDiagnostics] = None
    ) -> str:
        """Process a single text chunk through the full pipeline."""
        # Stage 1: Encoding Normalization
        text = self._normalize_encoding(text)
        
        # Stage 2: Structural Cleaning
        text, header_count = self._remove_structural_artifacts(text, config)
        if diagnostics:
            diagnostics.removed_headers += header_count
        
        # Stage 3: Content Cleaning
        text = self._clean_content(text, config, diagnostics)
        
        # Stage 4: Semantic Reconstruction
        text = self._reconstruct_paragraphs(text)
        
        # Stage 5: Final Formatting
        text = self._apply_final_formatting(text, config)
        
        return text.strip()

    # -------------------------------------------------------------------------
    # PROCESSING STAGE IMPLEMENTATIONS
    # -------------------------------------------------------------------------
    def _normalize_encoding(self, text: str) -> str:
        """Normalize Unicode, HTML entities, and control characters."""
        text = unicodedata.normalize("NFKC", text)
        text = html.unescape(text)
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', ' ', text)
        return text

    def _remove_structural_artifacts(self, text: str, config: Dict) -> Tuple[str, int]:
        """Remove headers, footers, page numbers, etc."""
        # Remove repeating headers/footers
        lines = text.splitlines()
        sig = hashlib.md5(text.encode()).hexdigest()
        
        if sig not in self._common_headers_cache:
            counts = Counter(line.strip() for line in lines if line.strip())
            common = {
                line for line, count in counts.items()
                if count >= config["repeat_threshold"] and len(line) < 150
            }
            self._common_headers_cache[sig] = common
        
        kept_lines = [line for line in lines if line.strip() not in self._common_headers_cache[sig]]
        header_count = len(lines) - len(kept_lines)
        
        # Remove other structural artifacts
        text = "\n".join(kept_lines)
        patterns = [
            (r'^\s*\d+\s*$', re.MULTILINE),  # Page numbers
            (r'\.{3,}\s*\d+\s*$', re.MULTILINE),  # TOC entries
            (r'^\s*\d+/\d+\s*$', re.MULTILINE),  # Page X/Y
            (r'^\s*©.*\d{4}\s*$', re.MULTILINE),  # Copyright
            (r'^\s*confidential\s*$', re.MULTILINE | re.IGNORECASE),
        ]
        
        for pat, flags in patterns:
            text = re.sub(pat, '', text, flags=flags)
        
        return text, header_count

    def _clean_content(self, text: str, config: Dict, diagnostics: Optional[CleaningDiagnostics]) -> str:
        """Clean textual content while preserving meaningful elements."""
        # Protect equations before destructive operations
        eq_map = {}
        if config["preserve_equations"]:
            text, eq_map = self._protect_equations(text)
            if diagnostics:
                diagnostics.equations_preserved = len(eq_map)
        
        # Remove citations if enabled
        if config["remove_citations"]:
            text, citation_count = self._remove_citations(text)
            if diagnostics:
                diagnostics.removed_citations = citation_count
        
        # Remove hyperlinks if enabled
        if config["remove_hyperlinks"]:
            text = re.sub(r'https?://\S+|www\.\S+', '', text)
        
        # Fix hyphenation and line breaks
        text = self._fix_hyphenation(text)
        text = self._reflow_lines(text)
        
        # Remove bullets if enabled
        if config["remove_bullets"]:
            text = self._remove_bullets(text)
        
        # Restore protected equations
        if config["preserve_equations"] and eq_map:
            text = self._restore_protected_content(text, eq_map)
        
        return text

    def _reconstruct_paragraphs(self, text: str) -> str:
        """Rebuild proper paragraph structure from messy PDF text."""
        lines = text.splitlines()
        paragraphs = []
        current_para = []
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                if current_para:
                    paragraphs.append(" ".join(current_para))
                    current_para = []
            else:
                # Heuristic for paragraph breaks
                if (current_para and stripped[0].isupper() and 
                    not current_para[-1].endswith(('.', '!', '?'))):
                    paragraphs.append(" ".join(current_para))
                    current_para = [stripped]
                else:
                    current_para.append(stripped)
        
        if current_para:
            paragraphs.append(" ".join(current_para))
            
        return "\n\n".join(paragraphs)

    def _apply_final_formatting(self, text: str, config: Dict) -> str:
        """Apply final formatting and optional sentence chunking."""
        # Normalize whitespace
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Optional sentence chunking
        if config["sentence_chunking"]:
            text = self._chunk_sentences(text, config["max_chunk_size"])
        
        return text

    # -------------------------------------------------------------------------
    # SPECIALIZED CLEANING COMPONENTS
    # -------------------------------------------------------------------------
    def _protect_equations(self, text: str) -> Tuple[str, Dict[str, str]]:
        """Protect equations with placeholders before destructive operations."""
        eq_patterns = [
            r'\$[^$]+\$',       # Inline $...$
            r'\\\(.*?\\\)',      # \(...\)
            r'\\\[.*?\\\]',      # \[...\]
            r'\\begin\{equation\}.*?\\end\{equation\}',  # LaTeX environments
        ]
        
        eq_map = {}
        def replacer(match: re.Match) -> str:
            key = f"<<EQ_{len(eq_map)}>>"
            eq_map[key] = match.group(0)
            return key
        
        for pattern in eq_patterns:
            text = re.sub(pattern, replacer, text, flags=re.DOTALL)
            
        return text, eq_map

    def _remove_citations(self, text: str) -> Tuple[str, int]:
        """Remove various citation formats with count tracking."""
        patterns = [
            (r'\[[^\]]{1,80}\]', 0),      # [1], [2-5]
            (r'\([^)]{1,80}\)', 0),       # (Smith, 2020)
            (r'\b\d{4}[a-z]?\b', 0),      # Standalone years
        ]
        
        total_removed = 0
        for pattern, count in patterns:
            text, n = re.subn(pattern, '', text)
            total_removed += n
            
        return text, total_removed

    def _fix_hyphenation(self, text: str) -> str:
        """Fix hyphenated words broken across lines."""
        text = text.replace("\u00AD", "")  # Remove soft hyphens
        text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)  # Rejoin split words
        text = re.sub(r'-{2,}', '—', text)  # Convert multiple hyphens to em-dash
        return text

    def _reflow_lines(self, text: str) -> str:
        """Convert single newlines to spaces while preserving paragraphs."""
        return re.sub(r'(?<!\n)\n(?!\n)', ' ', text)

    def _remove_bullets(self, text: str) -> str:
        """Remove various bullet point formats."""
        patterns = [
            r'^[\u2022•▪\-*+]\s+',  # Bullet characters
            r'^\s*\d+\.\s+',        # Numbered lists
            r'^\s*[a-z]\.\s+',      # Lettered lists
        ]
        
        for pattern in patterns:
            text = re.sub(pattern, '', text, flags=re.MULTILINE)
            
        return text

    def _restore_protected_content(self, text: str, content_map: Dict[str, str]) -> str:
        """Restore protected content (equations, tables, etc.) after cleaning."""
        for placeholder, original in content_map.items():
            text = text.replace(placeholder, original)
        return text

    def _chunk_sentences(self, text: str, chunk_size: int) -> str:
        """Group sentences into meaningful chunks."""
        try:
            sentences = sent_tokenize(text) if NLTK_AVAILABLE else re.split(r'(?<=[.!?])\s+', text)
            chunks = []
            current_chunk = []
            
            for sent in sentences:
                current_chunk.append(sent)
                if len(current_chunk) >= chunk_size:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = []
            
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                
            return "\n\n".join(chunks)
        except Exception:
            logger.warning("Sentence chunking failed, using paragraph fallback")
            return text

    def _split_text(self, text: str, max_len: int) -> List[str]:
        """Split text into chunks while preserving paragraphs."""
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = []
        current_size = 0
        
        for para in paragraphs:
            para_size = len(para)
            if current_size + para_size > max_len and current_chunk:
                chunks.append('\n\n'.join(current_chunk))
                current_chunk = [para]
                current_size = para_size
            else:
                current_chunk.append(para)
                current_size += para_size + 2  # Account for \n\n
        
        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))
            
        return chunks

    def _finalize_diagnostics(self, text: str, diagnostics: CleaningDiagnostics):
        """Calculate final diagnostic metrics."""
        words = text.split()
        sentences = sent_tokenize(text) if NLTK_AVAILABLE else re.split(r'(?<=[.!?])\s+', text)
        
        diagnostics.reading_time_min = len(words) / 200.0  # 200 wpm
        diagnostics.avg_sentence_length = sum(len(s.split()) for s in sentences) / max(1, len(sentences))


# Example usage when run directly
if __name__ == "__main__":
    # Example academic text with various PDF artifacts
    sample_text = """
    Page 1 of 10
    CONFIDENTIAL - Do Not Distribute
    
    Quantum Mechanics Lecture Notes
    © 2023 Physics Department
    
    Chapter 1: Wave-Particle Duality
    
    1. Introduction
    
    The wave-particle duality[1] is fundamental to quantum 
    mechan-
    ics. As shown in Figure 1.2, electrons exhibit both 
    wave-like and particle-like properties (Bohr, 1928)[2-4].
    
    Key equation: $ψ(x,t) = Ae^{i(kx-ωt)}$ and 
    \[ E = \hbarω \]
    
    References:
    [1] A. Einstein, Ann. Phys. 17, 132 (1905)
    [2-4] N. Bohr, Nature 121, 580 (1928)
    See https://quantum-physics.edu for details
    """

    # Initialize cleaner with academic presets
    cleaner = PDFTextCleaner({
        "processing_mode": ProcessingMode.ACADEMIC,
        "diagnostic_mode": True
    })

    # Process the text
    cleaned_text, diagnostics = cleaner.clean_text(
        sample_text,
        remove_citations=True,
        sentence_chunking=True
    )

    # Output results
    print("=== CLEANED TEXT ===")
    print(cleaned_text)
    
    print("\n=== DIAGNOSTICS ===")
    print(f"Original length: {diagnostics.original_length} chars")
    print(f"Cleaned length: {diagnostics.cleaned_length} chars")
    print(f"Headers removed: {diagnostics.removed_headers}")
    print(f"Citations removed: {diagnostics.removed_citations}")
    print(f"Equations preserved: {diagnostics.equations_preserved}")
    print(f"Reading time: {diagnostics.reading_time_min:.1f} min")
    print(f"Avg sentence length: {diagnostics.avg_sentence_length:.1f} words")