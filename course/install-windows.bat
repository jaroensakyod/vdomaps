@echo off
rem Map Studio installer for students: double-click this file.
rem If Windows shows "Windows protected your PC", click "More info" then "Run anyway".
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/jaroensakyod/vdomaps/main/course/install-windows.ps1 | iex"
echo.
pause
