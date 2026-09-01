# Zero-Dependency Local Web Server for Windows (using built-in .NET HttpListener)
$port = 8080
$url = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
} catch {
    Write-Error "Failed to start server. Port $port might be in use."
    pause
    exit
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Zero-Dependency Web Server Started Successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Local URL: $url" -ForegroundColor Cyan
Write-Host "Serving files from: $(Get-Location)"
Write-Host "Press Ctrl+C in this window to stop the server."
Write-Host "--------------------------------------------------"

# Automatically open default browser
try {
    Start-Process "http://localhost:$port/index.html"
} catch {
    # Fallback if browser process start fails
}

# Request processing loop
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }
        
        # Match file path relative to current working directory
        $filePath = Join-Path (Get-Location) $urlPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Identify MIME types for overlay simulator previews
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html" -or $ext -eq ".htm") { $contentType = "text/html" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript" }
            elseif ($ext -eq ".json") { $contentType = "application/json" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
            
            $res.ContentType = $contentType
            $res.ContentLength64 = $bytes.Length
            
            # Write response
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200] Serving: $urlPath ($contentType)" -ForegroundColor Gray
        } else {
            $res.StatusCode = 404
            Write-Host "[404] Not Found: $urlPath" -ForegroundColor Yellow
        }
        $res.OutputStream.Close()
    } catch {
        # Catch connection drop exceptions
    }
}
