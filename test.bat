if not "%minimized%"=="" goto :minimized
set minimized=true
@echo off
cd "G:\Users\Captnwalker1\Downloads\github\starter-express-api\"
G:
node test.mjs >> test.log

goto :EOF
:minimized