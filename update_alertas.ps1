# PowerShell script to update Mod_Alertas module in the macro-enabled Excel workbook.

$ErrorActionPreference = "Stop"

$projectDir = "c:\Users\esantame\OneDrive - NTT DATA EMEAL\Escritorio\Projetos Qualidade de Software (indicadores)\ADV Lira Melo (Planilha)"
$vbaSourcePath = "$projectDir\vba_source"
$xlsmFile = "$projectDir\ADV_Lira_Melo.xlsm"

Write-Output "Starting ADV Lira Melo Mod_Alertas update..."

# 1. Get Excel version to configure registry
$excel = New-Object -ComObject Excel.Application
$excelVersion = $excel.Version
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
Remove-Variable excel -ErrorAction SilentlyContinue

# 2. Modify registry to enable AccessVBOM (Trust access to Visual Basic Project)
$registryPath = "HKCU:\Software\Microsoft\Office\$excelVersion\Excel\Security"
$oldAccessVBOM = $null
$regValueName = "AccessVBOM"

if (Test-Path $registryPath) {
    $oldAccessVBOM = (Get-ItemProperty -Path $registryPath -Name $regValueName -ErrorAction SilentlyContinue).$regValueName
} else {
    New-Item -Path $registryPath -Force | Out-Null
}

Write-Output "Enabling VBA Project Access in Registry..."
Set-ItemProperty -Path $registryPath -Name $regValueName -Value 1 -Force

# Helper function to restore registry at exit
function Restore-Registry {
    Write-Output "Restoring VBA Project Access registry key..."
    if ($oldAccessVBOM -ne $null) {
        Set-ItemProperty -Path $registryPath -Name $regValueName -Value $oldAccessVBOM -Force
    } else {
        Remove-ItemProperty -Path $registryPath -Name $regValueName -ErrorAction SilentlyContinue
    }
}

try {
    # 3. Open workbook
    Write-Output "Opening Excel file: $xlsmFile..."
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    $workbook = $excel.Workbooks.Open($xlsmFile)
    $vbProject = $workbook.VBProject
    
    # 4. Remove existing Mod_Alertas if present
    try {
        $oldComp = $vbProject.VBComponents.Item("Mod_Alertas")
        Write-Output "Removing existing Mod_Alertas component..."
        $vbProject.VBComponents.Remove($oldComp)
    } catch {
        Write-Warning "Mod_Alertas component not found in VBProject. Will import as new."
    }
    
    # 5. Import updated Mod_Alertas.bas
    $fullPath = "$vbaSourcePath\Mod_Alertas.bas"
    Write-Output "Importing updated Mod_Alertas.bas from $fullPath..."
    $vbProject.VBComponents.Import($fullPath) | Out-Null
    
    # 6. Save and close
    Write-Output "Mod_Alertas updated successfully. Saving and closing Excel..."
    $workbook.Save()
    $workbook.Close($true)
    $excel.Quit()
    
    # Release COM resources
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    Remove-Variable workbook -ErrorAction SilentlyContinue
    Remove-Variable excel -ErrorAction SilentlyContinue
    
    # Restore registry
    Restore-Registry
    Write-Output "Update completed successfully!"
    
} catch {
    Write-Error "An error occurred during update: $_"
    
    if ($null -ne $workbook) {
        try { $workbook.Close($false) } catch {}
    }
    if ($null -ne $excel) {
        try { $excel.Quit() } catch {}
    }
    
    Restore-Registry
    exit 1
}
