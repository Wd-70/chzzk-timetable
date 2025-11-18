# ZIP 파일 생성 스크립트

# 임시 폴더 생성
$tempDir = 'chzzk-timetable-temp'
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# 필요한 파일들 복사
$files = @(
    'manifest.json',
    'popup.html', 'popup.js', 'popup.css',
    'admin.html', 'admin.js', 'admin.css', 'admin-config.js',
    'background.js',
    'content.js', 'content.css',
    'utils.js',
    'firebase-config.js', 'firebase-service.js',
    'privacy.html'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $tempDir
        Write-Host "Copied: $file"
    } else {
        Write-Host "Warning: $file not found" -ForegroundColor Yellow
    }
}

# 폴더 복사
if (Test-Path 'firebase-sdk') {
    Copy-Item -Recurse 'firebase-sdk' -Destination $tempDir
    Write-Host "Copied: firebase-sdk folder"
}

if (Test-Path 'images') {
    Copy-Item -Recurse 'images' -Destination $tempDir
    Write-Host "Copied: images folder"
}

# 기존 ZIP 파일 삭제 (있으면)
$zipName = 'chzzk-timetable-v1.1.0.zip'
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# ZIP 생성
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force

# 임시 폴더 삭제
Remove-Item -Recurse -Force $tempDir

# 결과 표시
if (Test-Path $zipName) {
    $size = (Get-Item $zipName).Length / 1MB
    Write-Host "`nZIP file created successfully!" -ForegroundColor Green
    Write-Host "File: $zipName"
    Write-Host "Size: $([math]::Round($size, 2)) MB"
} else {
    Write-Host "`nFailed to create ZIP file" -ForegroundColor Red
}
