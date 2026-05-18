@echo off
title Calculadora Agronomica
echo.
echo  =======================================
echo   CALCULADORA AGRONOMICA - Iniciando...
echo  =======================================
echo.
echo  Abriendo aplicacion en el navegador...
echo  (Cierra esta ventana para apagar la app)
echo.

cd /d "%~dp0"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173"
npm run dev
