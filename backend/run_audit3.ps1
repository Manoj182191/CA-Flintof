$env:PYTHONIOENCODING = 'utf-8'
& 'C:\Users\dell\AppData\Local\Programs\Python\Python312\python.exe' -m pip install requests --quiet 2>&1 | Out-String -Width 200 | Out-File -FilePath 'C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\audit_output.txt' -Encoding utf8
Write-Host "--- installed requests ---"
& 'C:\Users\dell\AppData\Local\Programs\Python\Python312\python.exe' 'C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\audit_startup.py' 2>&1 | Out-String -Width 200 | Out-File -FilePath 'C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\audit_output.txt' -Encoding utf8 -Append
Write-Host "DONE"
