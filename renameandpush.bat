@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ========================================
::  Step 1: 重命名 oral_ai_backup_*.json -> backup.json
:: ========================================

set "SCRIPT_DIR=%~dp0"
set "BACKUP_JSON=%SCRIPT_DIR%backup.json"
set "FOUND="
set "COUNT=0"

:: 查找 oral_ai_backup_*.json
for %%f in ("%SCRIPT_DIR%oral_ai_backup_*.json") do (
    set "FOUND=%%f"
    set /a COUNT+=1
)

if not defined FOUND (
    echo [ERROR] 未找到 oral_ai_backup_*.json 文件
    echo         请先在应用中导出数据
    exit /b 1
)

if !COUNT! gtr 1 (
    echo [WARN] 找到多个匹配文件，使用最后一个:
    for %%f in ("%SCRIPT_DIR%oral_ai_backup_*.json") do (
        echo   - %%~nxf
    )
)

echo [1/5] 删除 backup.json
if exist "%BACKUP_JSON%" (
    del "%BACKUP_JSON%"
    echo       已删除
) else (
    echo       backup.json 不存在，跳过
)

for %%f in ("!FOUND!") do set "SOURCE_NAME=%%~nxf"
echo [2/5] 重命名 !SOURCE_NAME! -^> backup.json
ren "!FOUND!" "backup.json"
if errorlevel 1 (
    echo [ERROR] 重命名失败
    exit /b 1
)
echo       完成

:: ========================================
::  Step 2: Git push
:: ========================================

:: 检查是否在 git 仓库中
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 当前目录不是 git 仓库
    exit /b 1
)

:: 获取 commit message
if "%~1"=="" (
    set "MSG=更新备份"
) else (
    set "MSG=%*"
)

echo.
echo [3/5] git add -A
git add -A
if errorlevel 1 (
    echo [ERROR] git add 失败
    exit /b 1
)

echo [4/5] git commit -m "!MSG!"
git commit -m "!MSG!"
if errorlevel 1 (
    echo [ERROR] git commit 失败
    exit /b 1
)

echo [5/5] git push
git push
if errorlevel 1 (
    echo [WARN] push 失败，尝试设置上游分支...
    for /f "tokens=*" %%b in ('git branch --show-current') do set BRANCH=%%b
    git push --set-upstream origin !BRANCH!
    if errorlevel 1 (
        echo [ERROR] git push 失败
        exit /b 1
    )
)

echo.
echo ========================================
echo  重命名并推送成功!
echo ========================================
