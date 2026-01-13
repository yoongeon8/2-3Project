@echo off
setlocal enabledelayedexpansion

set SOURCES=
for /r src %%f in (*.cpp) do (
    set SOURCES=!SOURCES! "%%f"
)

g++ -std=c++11 -I src/game/core -I src/game -I src/game/battle -I src/game/input %SOURCES% -o main.exe

echo Build complete.