# Creates a small, isolated environment without downloading local ML models.
$ErrorActionPreference = "Stop"
$BackendPython = Get-Command python -ErrorAction Stop
$VersionOk = & $BackendPython.Source -c "import sys; print(int(sys.version_info >= (3, 10)))"

if ($VersionOk -ne "1") {
    throw "HiveQ requires Python 3.10 or newer. Install Python 3.12, then rerun setup.ps1."
}

$BackendVenv = Join-Path $PSScriptRoot ".venv"
& $BackendPython.Source -m venv $BackendVenv
if ($LASTEXITCODE -ne 0) { throw "Could not create the backend Python environment." }
$VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
& $VenvPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw "Could not update pip in the backend environment." }
& $VenvPython -m pip install -r (Join-Path $PSScriptRoot "requirements.txt")
if ($LASTEXITCODE -ne 0) { throw "Could not install the pinned backend dependencies." }

Write-Host "Setup complete. Run from the ml-backend directory: .\.venv\Scripts\python -m uvicorn app.main:app --reload --env-file .env" -ForegroundColor Cyan
