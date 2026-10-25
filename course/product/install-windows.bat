@echo off
rem Story Studio installer: double-click this file (keep it next to the story-studio folder).
rem If Windows shows "Windows protected your PC", click "More info" then "Run anyway".
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1"
echo.
pause
