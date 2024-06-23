if not "%minimized%"=="" goto :minimized
set minimized=true
@echo off
cd "C:\Users\YOURUSER\Downloads\github\starter-express-api\"
G:
node claim.mjs >> claim.log 2>>&1

goto :EOF
:minimized