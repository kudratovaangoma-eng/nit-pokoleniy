@echo off
chcp 65001 >nul
title Нить поколений - сайт
cd /d "%~dp0"
echo.
echo   Запускаю сайт. Подождите 10-15 секунд,
echo   браузер откроется сам.
echo.
echo   Чтобы закрыть сайт - закройте это окно.
echo.
start "" http://localhost:5173
call npm run dev -- --port 5173 --host
echo.
echo   Сайт остановлен. Нажмите любую клавишу.
pause >nul
