$mongoExe = 'D:\mongodb-portable\mongodb-win32-x86_64-windows-8.2.5\bin\mongod.exe'
$dbPath = 'D:\MongoDB\data\db'
$logPath = 'D:\MongoDB\log\mongod-live.log'

if (!(Test-Path $mongoExe)) {
  Write-Error "mongod not found at $mongoExe"
  exit 1
}

if (!(Test-Path $dbPath)) {
  New-Item -ItemType Directory -Path $dbPath -Force | Out-Null
}

$existing = Get-Process mongod -ErrorAction SilentlyContinue
if ($existing) {
  Write-Output 'MongoDB is already running.'
  $existing | Select-Object Id, ProcessName, Path | Format-Table -AutoSize
  exit 0
}

Start-Process -FilePath $mongoExe -ArgumentList @(
  '--dbpath', $dbPath,
  '--bind_ip', '127.0.0.1',
  '--port', '27017',
  '--logpath', $logPath,
  '--logappend'
) | Out-Null

Start-Sleep -Seconds 2
$listener = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  Write-Output 'MongoDB started and listening on 127.0.0.1:27017'
} else {
  Write-Error 'MongoDB did not start correctly. Check D:\MongoDB\log\mongod-live.log'
  exit 1
}
