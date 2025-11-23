@echo off
REM Quick Start Script for Quotes Backend
REM Double-click this file to start all backend services

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File ".\start-backend.ps1"
pause
