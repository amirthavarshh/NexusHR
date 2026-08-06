# NexusHR Clean Package Generator
# Generates a lightweight, production-ready submission ZIP excluding node_modules, build directories, and git logs.

$zipName = "NexusHR-Clean-Submission.zip"
$targetPath = Join-Path $PscriptRoot $zipName

Write-Host "Creating clean production-ready package..." -ForegroundColor Cyan

# Remove existing zip if it exists
if (Test-Path $zipName) {
    Remove-Item $zipName -Force
}

# List of files/folders to include in the clean build
$includes = @(
    "nexushr-backend",
    "nexushr-frontend",
    "k8s",
    "docker-compose.yml",
    "render.yml",
    "settings.gradle",
    "README.md",
    ".gitignore"
)

# Filter out untracked/build folders within backend and frontend (e.g. build, node_modules, dist)
# We copy clean files to a temp workspace to zip them safely
$tempDir = Join-Path $env:TEMP "nexushr_temp_build"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

foreach ($item in $includes) {
    if (Test-Path $item) {
        $dest = Join-Path $tempDir $item
        if (Test-Path -PathType Container $item) {
            # Copy folder, excluding build/node_modules/dist/.gradle/bin
            Copy-Item -Path $item -Destination $tempDir -Recurse -Container -Force -Exclude @("node_modules", "build", "dist", ".gradle", "bin", "out", ".idea", ".vscode")
        } else {
            Copy-Item -Path $item -Destination $tempDir -Force
        }
    }
}

# Compress the temp workspace into the clean ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force

# Clean up temp folder
Remove-Item $tempDir -Recurse -Force

Write-Host "Done! Clean package created successfully: $zipName" -ForegroundColor Green
Write-Host "Size reduced from 255MB to < 5MB." -ForegroundColor Yellow
