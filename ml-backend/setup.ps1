# setup.ps1 - A script to set up the ML backend environment

Write-Host "STEP 1: Installing Python packages from requirements.txt..." -ForegroundColor Green
pip install -r requirements.txt

Write-Host "`nSTEP 2: Downloading Spacy language model (en_core_web_sm)..." -ForegroundColor Green
python -m spacy download en_core_web_sm

Write-Host "`nSTEP 3: Downloading NLTK universal tagset..." -ForegroundColor Green
python -m nltk.downloader universal_tagset

Write-Host "`nSetup Complete! Your environment is ready." -ForegroundColor Cyan