@echo off
echo Starting ESBOX Server with Caching...
cd /d D:\Karthik\ESBOX\server
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
