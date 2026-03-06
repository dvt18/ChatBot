@echo off
echo Starting npm install... > install.log
call npm install >> install.log 2>&1
echo Done >> install.log
