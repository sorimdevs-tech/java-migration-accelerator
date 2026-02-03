@echo off
REM Git push script for Java Migration Accelerator
cd /d "c:\Users\user\Downloads\java-migration-accelerator-clean-main\java-migration-accelerator-clean-main"

REM Disable git pager
git config core.pager cat

REM Try to integrate remote changes
echo.
echo Attempting to rebase with remote changes...
git rebase origin/main

REM Check rebase status
if %ERRORLEVEL% EQU 0 (
    echo Rebase successful. Proceeding to push...
    git push origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo SUCCESS! Changes pushed to remote repository
        echo.
        git log --oneline -3
    ) else (
        echo Failed to push. Trying force push...
        git push -f origin main
    )
) else (
    echo Rebase has conflicts or issues. Aborting rebase...
    git rebase --abort
    echo Attempting regular merge...
    git merge origin/main -m "Merge remote with local changes"
    if %ERRORLEVEL% EQU 0 (
        echo Merge successful. Pushing...
        git push origin main
        echo Push completed
        git log --oneline -3
    ) else (
        echo Merge failed. Using force push...
        git push -f origin main
        echo Force push completed
    )
)

echo.
echo Showing final status...
git status
