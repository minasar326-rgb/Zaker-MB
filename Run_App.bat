@echo off
cd /d "%~dp0"
title Zaker Study Planner

echo Starting Zaker Study Planner on port 5180...
start "" "http://localhost:5180"
call npm run dev
