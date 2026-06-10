$ErrorActionPreference = 'Continue'
$env:PYTHONIOENCODING = 'utf-8'
$out = & 'C:\Users\dell\AppData\Local\Programs\Python\Python312\python.exe' 'C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\audit_startup.py' 2>&1 | Out-String
$out | Out-File -FilePath 'C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\audit_output.txt' -Encoding utf8
Write-Host "WROTE: C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\audit_output.txt ($($out.Length) chars)"
