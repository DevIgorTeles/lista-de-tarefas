# Script para instalar dependências manualmente
Write-Host "Instalando dependências manualmente..."

# Criar pasta node_modules se não existir
if (-not (Test-Path -Path "node_modules")) {
    New-Item -ItemType Directory -Path "node_modules"
}

# Função para baixar e extrair pacote
function Install-Package {
    param (
        [string]$PackageName,
        [string]$Version
    )
    
    Write-Host "Instalando $PackageName@$Version..."
    
    # Criar pasta para o pacote
    $packageDir = "node_modules/$PackageName"
    if (-not (Test-Path -Path $packageDir)) {
        New-Item -ItemType Directory -Path $packageDir -Force
    }
    
    # URL do pacote no npm
    $url = "https://registry.npmjs.org/$PackageName/-/$PackageName-$Version.tgz"
    
    try {
        # Baixar o pacote
        $tempFile = "temp_$PackageName.tgz"
        Invoke-WebRequest -Uri $url -OutFile $tempFile
        
        # Extrair o pacote
        tar -xzf $tempFile -C "node_modules/"
        
        # Mover os arquivos para o diretório correto
        if (Test-Path -Path "node_modules/package") {
            Copy-Item -Path "node_modules/package/*" -Destination $packageDir -Recurse -Force
            Remove-Item -Path "node_modules/package" -Recurse -Force
        }
        
        # Limpar arquivo temporário
        Remove-Item -Path $tempFile -Force
        
        Write-Host "$PackageName instalado com sucesso!"
    }
    catch {
        Write-Host "Erro ao instalar $PackageName: $_"
    }
}

# Instalar dependências principais
Install-Package "express" "4.21.2"
Install-Package "cors" "2.8.5"
Install-Package "body-parser" "1.20.2"
Install-Package "dotenv" "16.4.5"
Install-Package "mongoose" "8.9.5"
Install-Package "jsonwebtoken" "9.0.2"
Install-Package "bcryptjs" "2.4.3"
Install-Package "express-validator" "7.0.1"

Write-Host "Instalação concluída!" 