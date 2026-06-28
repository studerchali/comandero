@echo off
title Comandero
cd /d "%~dp0"

if not exist "offline-package\INICIAR.bat" (
  echo.
  echo  Preparando Comandero por primera vez...
  echo.
  call npm run offline:build
  if errorlevel 1 (
    echo.
    pause
    exit /b 1
  )
)

cd offline-package
call INICIAR.bat