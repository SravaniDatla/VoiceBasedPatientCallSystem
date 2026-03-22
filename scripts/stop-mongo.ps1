$procs = Get-Process mongod -ErrorAction SilentlyContinue

if (!$procs) {
  Write-Output 'MongoDB is not running.'
  exit 0
}

$procs | Stop-Process -Force
Start-Sleep -Seconds 1
Write-Output 'MongoDB stopped.'
