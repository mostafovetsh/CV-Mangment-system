@echo off
echo ========================================
echo Testing 3 Statuses System
echo ========================================
echo.

echo Step 1: Testing Backend Configuration...
echo.
curl -s http://localhost:3001/api/config > config_response.json
if %errorlevel% neq 0 (
    echo ERROR: Backend is not running!
    echo Please start backend first:
    echo   cd backend
    echo   npm start
    pause
    exit /b 1
)

echo Backend responded successfully!
echo.

echo Step 2: Checking Status Count...
findstr /C:"\"value\":\"new\"" config_response.json >nul
if %errorlevel% neq 0 (
    echo ERROR: Status "new" not found!
) else (
    echo ✓ Found status: new
)

findstr /C:"\"value\":\"progress\"" config_response.json >nul
if %errorlevel% neq 0 (
    echo ERROR: Status "progress" not found!
) else (
    echo ✓ Found status: progress
)

findstr /C:"\"value\":\"complete\"" config_response.json >nul
if %errorlevel% neq 0 (
    echo ERROR: Status "complete" not found!
) else (
    echo ✓ Found status: complete
)

echo.
echo Step 3: Checking for OLD statuses (should NOT exist)...
findstr /C:"\"value\":\"hired\"" config_response.json >nul
if %errorlevel% equ 0 (
    echo WARNING: Old status "hired" still exists!
) else (
    echo ✓ Old status "hired" removed
)

findstr /C:"\"value\":\"rejected\"" config_response.json >nul
if %errorlevel% equ 0 (
    echo WARNING: Old status "rejected" still exists!
) else (
    echo ✓ Old status "rejected" removed
)

echo.
echo Step 4: Checking Priority System (should be removed)...
findstr /C:"priorityLevels" config_response.json >nul
if %errorlevel% equ 0 (
    echo WARNING: Priority system still exists!
) else (
    echo ✓ Priority system removed
)

echo.
echo ========================================
echo Full Response saved to: config_response.json
echo.
echo To view full response:
echo   type config_response.json
echo.
echo Or open in browser:
echo   http://localhost:3001/api/config
echo ========================================
echo.

pause
