$line = Get-Content .env | Where-Object { $_ -match 'DATABASE_URL' }
$line
