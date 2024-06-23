@REM if not "%minimized%"=="" goto :minimized
@REM set minimized=true
@echo off
cd "C:\Users\YOURUSER\Downloads\github\starter-express-api\"
G:
node test.mjs >> test.log 2>>&1

@REM goto :EOF
@REM :minimized