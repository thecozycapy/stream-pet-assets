@echo off
title Portfolio Local Web Server
cd /d "%~dp0"
echo Starting Zero-Dependency local server...
powershell -NoProfile -ExecutionPolicy Bypass -File "start-server.ps1"
pause
