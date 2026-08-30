# PowerShell script to install all dependencies for modern UI stack
# Run from project root: .\install-new-stack.ps1

Write-Host "🚀 Installing dependencies for modern UI stack..." -ForegroundColor Cyan
Write-Host ""

# Set alternative cache location if default fails
$altCache = "$env:TEMP\npm-cache-alt"
if (-not (Test-Path $altCache)) {
    New-Item -ItemType Directory -Path $altCache | Out-Null
}

Write-Host "📦 Step 1/4: Installing Tailwind CSS core..." -ForegroundColor Yellow
npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest --cache $altCache
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  npm failed, trying with alternate cache..." -ForegroundColor Red
    npm config set cache $altCache
    npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest
}

Write-Host ""
Write-Host "📦 Step 2/4: Installing shadcn/ui dependencies..." -ForegroundColor Yellow
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-progress @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch class-variance-authority clsx tailwind-merge --cache $altCache

Write-Host ""
Write-Host "📦 Step 3/4: Installing animations and icons..." -ForegroundColor Yellow
npm install framer-motion lucide-react tailwindcss-animate --cache $altCache

Write-Host ""
Write-Host "📦 Step 4/4: Installing toast notifications..." -ForegroundColor Yellow
npm install sonner --cache $altCache

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy configuration files (see docs/COPY_CONFIG.md)" -ForegroundColor White
Write-Host "2. Start migration (see docs/MIGRATION_GUIDE.md)" -ForegroundColor White
Write-Host "3. Test demo mode (see docs/DEMO_MODE.md)" -ForegroundColor White
