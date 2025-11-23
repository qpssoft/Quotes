@echo off
REM Stop All Backend Services
REM Double-click this file to stop all running backend processes

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File ".\stop-backend.ps1"
pause
