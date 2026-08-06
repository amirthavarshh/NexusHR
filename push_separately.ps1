$status = git status --porcelain
foreach ($line in $status) {
    if ($line.Length -gt 3) {
        $file = $line.Substring(3).Trim()
        
        # Handle quotes if filename has spaces
        if ($file.StartsWith('"') -and $file.EndsWith('"')) {
            $file = $file.Substring(1, $file.Length - 2)
        }
        
        Write-Host "Processing: $file"
        git add "$file"
        
        $msg = "Update $file"
        if ($line.StartsWith("??")) { 
            $msg = "Add $file" 
        } elseif ($line.StartsWith(" D") -or $line.StartsWith("D ")) { 
            $msg = "Remove $file" 
        }
        
        git commit -m "$msg"
        git push
    }
}
Write-Host "Done!"
