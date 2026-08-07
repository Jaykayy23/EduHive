# Creates a small, isolated environment without downloading local ML models.
$ErrorActionPreference = "Stop"
$Python = Get-Command python -ErrorAction Stop
$VersionOk = & $Python.Source -c "import sys; print(int(sys.version_info >= (3, 10)))"

if ($VersionOk -ne "1") {
    throw "HiveQ requires Python 3.10 or newer. Install Python 3.12, then rerun setup.ps1."
}

& $Python.Source -m venv .venv
$VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
& $VenvPython -m pip install --upgrade pip
& $VenvPython -m pip install -r (Join-Path $PSScriptRoot "requirements.txt")

Write-Host "Setup complete. Start with: .\.venv\Scripts\python -m uvicorn app.main:app --reload --env-file .env" -ForegroundColor Cyan
