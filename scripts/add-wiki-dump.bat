@echo off
chcp 65001 >nul
powershell -ExecutionPolicy Bypass -File "%~dp0add-wiki-dump.ps1"
pause
