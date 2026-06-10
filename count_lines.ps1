$total = 0
Write-Output "=== BACKEND PYTHON FILES ==="
Get-ChildItem -Path backend\app -Recurse -Filter *.py | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    Write-Output ("{0,-80} {1,6}" -f $_.FullName.Replace("C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\", ""), $lines)
    $script:total += $lines
}
Write-Output ("`nBACKEND TOTAL: {0}" -f $total)

$total = 0
Write-Output "`n=== FRONTEND TSX/TS FILES ==="
Get-ChildItem -Path frontend\src -Recurse -Include *.tsx,*.ts,*.css | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    Write-Output ("{0,-80} {1,6}" -f $_.FullName.Replace("C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\", ""), $lines)
    $script:total += $lines
}
Write-Output ("`nFRONTEND TOTAL: {0}" -f $total)

$total = 0
Write-Output "`n=== MOBILE FILES ==="
Get-ChildItem -Path mobile -Recurse -File | ForEach-Object {
    $lines = (Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    Write-Output ("{0,-80} {1,6}" -f $_.FullName.Replace("C:\Users\dell\Desktop\CA MY PERSONAL APP\ca-erp\", ""), $lines)
    $script:total += $lines
}
Write-Output ("`nMOBILE TOTAL: {0}" -f $total)
