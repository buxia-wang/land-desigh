@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto try_py
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)" >nul 2>nul
if errorlevel 1 goto try_py
node "%~dp0preview.mjs"
goto finished
:try_py
where py >nul 2>nul
if errorlevel 1 goto try_python
py -3 -c "import sys; assert sys.version_info >= (3, 8)" >nul 2>nul
if errorlevel 1 goto try_python
py -3 "%~dp0preview.py"
goto finished
:try_python
where python >nul 2>nul
if errorlevel 1 goto missing
python -c "import sys; assert sys.version_info >= (3, 8)" >nul 2>nul
if errorlevel 1 goto missing
python "%~dp0preview.py"
goto finished
:missing
echo Install Node.js LTS or Python 3, then run this file again.
echo Node.js: https://nodejs.org/en/download
echo Python: https://www.python.org/downloads/windows/
echo See WINDOWS.md for editing and model import instructions.
:finished
pause
