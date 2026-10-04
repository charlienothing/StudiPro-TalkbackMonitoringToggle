$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Dist = Join-Path $Root 'dist'
$TempZip = Join-Path $Dist 'Talkback_Record_Guard.zip'
$Package = Join-Path $Dist 'Talkback_Record_Guard.package'

$Files = @(
    (Join-Path $Root 'main.js'),
    (Join-Path $Root 'metainfo.xml'),
    (Join-Path $Root 'classfactory.xml')
)

foreach ($File in $Files) {
    if (-not (Test-Path $File)) {
        throw "Required file not found: $File"
    }
}

New-Item -ItemType Directory -Path $Dist -Force | Out-Null
Remove-Item $TempZip -Force -ErrorAction SilentlyContinue
Remove-Item $Package -Force -ErrorAction SilentlyContinue

Compress-Archive -Path $Files -DestinationPath $TempZip -Force
Move-Item -Path $TempZip -Destination $Package -Force

Write-Host "Created: $Package"
