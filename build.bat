@echo off
echo Starting npm run build... > build.log
call npm run build >> build.log 2>&1
echo Done >> build.log
