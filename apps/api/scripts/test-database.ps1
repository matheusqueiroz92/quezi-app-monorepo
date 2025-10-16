# Script PowerShell para testar conexão com banco de dados

Write-Host "🧪 Testando conexão com banco de dados PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Verifica se o Docker está rodando
$dockerStatus = docker ps --filter "name=quezi" --format "{{.Names}}" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está rodando ou não está instalado" -ForegroundColor Red
    Write-Host "Execute: npm run docker:up" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker rodando" -ForegroundColor Green

# Lista containers do projeto
Write-Host ""
Write-Host "📦 Containers ativos:" -ForegroundColor Cyan
docker ps --filter "name=quezi" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Testa conexão com PostgreSQL
Write-Host ""
Write-Host "🔌 Testando conexão PostgreSQL..." -ForegroundColor Cyan

$env:PGPASSWORD = "quezi_password"
$result = docker exec quezi_db psql -U quezi_user -d quezi_db -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexão com PostgreSQL estabelecida!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Informações do banco:" -ForegroundColor Cyan
    
    # Conta registros nas tabelas
    $tables = @("users", "categories", "professional_profiles", "services", "appointments", "reviews")
    
    foreach ($table in $tables) {
        $count = docker exec quezi_db psql -U quezi_user -d quezi_db -t -c "SELECT COUNT(*) FROM $table;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  $table : $($count.Trim()) registros" -ForegroundColor White
        }
    }
    
} else {
    Write-Host "❌ Falha na conexão com PostgreSQL" -ForegroundColor Red
    Write-Host $result
    exit 1
}

Write-Host ""
Write-Host "✨ Ferramentas disponíveis:" -ForegroundColor Cyan
Write-Host "  • Prisma Studio: http://localhost:5555 (npm run prisma:studio)" -ForegroundColor White
Write-Host "  • pgAdmin: http://localhost:5050 (admin@quezi.com / admin_secure_password)" -ForegroundColor White
Write-Host "  • API Swagger: http://localhost:3333/docs" -ForegroundColor White
Write-Host ""

