$env:PYTHONIOENCODING = 'utf-8'
& 'C:\Users\dell\AppData\Local\Programs\Python\Python312\python.exe' -m pytest 'C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\tests' -v --tb=short 2>&1 | Out-String -Width 200 | Out-File -FilePath 'C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\backend\test_output.txt' -Encoding utf8
Write-Host "DONE - see test_output.txt"
