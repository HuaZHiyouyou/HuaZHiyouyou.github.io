@echo off
chcp 65001 >nul
echo ========================================
echo   桦知柚 本地管理服务器
echo ========================================
echo.
echo 正在启动服务器...
echo.
cd /d "%~dp0"
node js\server.js
pause
