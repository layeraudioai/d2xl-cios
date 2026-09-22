@echo off
echo Unpacking BC...
tools\other\WadMii.exe -in patch_work\BC_orig.wad -out patch_work\BC_unpacked
if %errorlevel% neq 0 echo Error unpacking BC!

echo Unpacking MIOS...
tools\other\WadMii.exe -in patch_work\MIOS_orig.wad -out patch_work\MIOS_unpacked
if %errorlevel% neq 0 echo Error unpacking MIOS!

echo Process completed.
pause
