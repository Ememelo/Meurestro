# PowerShell script to compile and assemble the redesigned ADV Lira Melo (Planilha) system.

$ErrorActionPreference = "Stop"

$projectDir = "c:\Users\esantame\OneDrive - NTT DATA EMEAL\Escritorio\Projetos Qualidade de Software (indicadores)\ADV Lira Melo (Planilha)"
$vbaSourcePath = "$projectDir\vba_source"
$baseFile = "$projectDir\ADV_Lira_Melo_Base.xlsx"
$finalFile = "$projectDir\ADV_Lira_Melo.xlsm"

Write-Output "Starting ADV Lira Melo System assembly (v2)..."

# 1. Get Excel version to configure registry
try {
    $excelTest = New-Object -ComObject Excel.Application
    $excelVersion = $excelTest.Version
    $excelTest.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excelTest) | Out-Null
    Remove-Variable excelTest -ErrorAction SilentlyContinue
    Write-Output "Excel version detected: $excelVersion"
} catch {
    Write-Error "Failed to initialize Excel COM object. Excel must be installed to run this script. Details: $_"
    exit 1
}

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

# Helper to set control properties safely
function Set-ControlProperty($ctrl, $name, $value) {
    try {
        $ctrl.$name = $value
    } catch {
        try {
            $ctrl.Properties.Item($name).Value = $value
        } catch {
            Write-Warning "Could not set property $name on control $($ctrl.Name)"
        }
    }
}

# Helper to draw a modern flat button shape in a sheet and assign a macro
function DrawButton($ws, $rangeAddress, $name, $text, $macro, $rgbColor) {
    $range = $ws.Range($rangeAddress)
    # 5 = msoShapeRoundedRectangle
    $btn = $ws.Shapes.AddShape(5, $range.Left + 2, $range.Top + 2, $range.Width - 4, $range.Height - 4)
    $btn.Name = $name
    $btn.TextFrame.Characters().Text = $text
    $btn.TextFrame.Characters().Font.Name = "Segoe UI"
    $btn.TextFrame.Characters().Font.Size = 9
    $btn.TextFrame.Characters().Font.Bold = $true
    $btn.TextFrame.Characters().Font.Color = 16777215 # White
    $btn.TextFrame.HorizontalAlignment = -4108 # xlHAlignCenter
    $btn.TextFrame.VerticalAlignment = -4108 # xlVAlignCenter
    
    $btn.Fill.Solid()
    $btn.Fill.ForeColor.RGB = $rgbColor
    $btn.Line.Visible = 0 # No borders
    $btn.OnAction = $macro
}

try {
    # 3. Open base Excel file
    Write-Output "Opening base Excel file..."
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    $workbook = $excel.Workbooks.Open($baseFile)
    
    # 4. Save workbook as macro-enabled
    Write-Output "Saving workbook as Macro-Enabled..."
    $workbook.SaveAs($finalFile, 52) # 52 = xlOpenXMLWorkbookMacroEnabled
    
    $vbProject = $workbook.VBProject
    
    # 5. Import standard modules (.bas)
    $basFiles = @("Mod_Seguranca.bas", "Mod_Cadastro.bas", "Mod_Helpers.bas", "Mod_Alertas.bas", "Mod_Relatorios.bas")
    foreach ($basFile in $basFiles) {
        $fullPath = "$vbaSourcePath\$basFile"
        Write-Output "Importing standard module: $basFile..."
        $vbProject.VBComponents.Import($fullPath) | Out-Null
    }
    
    # 6. Create Form_Login programmatically (to avoid .frx dependency)
    Write-Output "Building Form_Login programmatically..."
    $frmLogin = $vbProject.VBComponents.Add(3) # 3 = vbext_ct_MSForm
    $frmLogin.Name = "Form_Login"
    Set-ControlProperty $frmLogin "Caption" "ADV Lira Melo - Acesso Restrito"
    Set-ControlProperty $frmLogin "Width" 280
    Set-ControlProperty $frmLogin "Height" 160
    
    $lblUser = $frmLogin.Designer.Controls.Add("Forms.Label.1")
    $lblUser.Caption = "Usuario:"
    $lblUser.Left = 30
    $lblUser.Top = 25
    $lblUser.Width = 60
    $lblUser.Height = 15
    
    $txtUser = $frmLogin.Designer.Controls.Add("Forms.TextBox.1", "txtUsuario")
    $txtUser.Left = 90
    $txtUser.Top = 23
    $txtUser.Width = 150
    $txtUser.Height = 18
    
    $lblPass = $frmLogin.Designer.Controls.Add("Forms.Label.1")
    $lblPass.Caption = "Senha:"
    $lblPass.Left = 30
    $lblPass.Top = 55
    $lblPass.Width = 60
    $lblPass.Height = 15
    
    $txtPass = $frmLogin.Designer.Controls.Add("Forms.TextBox.1", "txtSenha")
    $txtPass.Left = 90
    $txtPass.Top = 53
    $txtPass.Width = 150
    $txtPass.Height = 18
    Set-ControlProperty $txtPass "PasswordChar" "*"
    
    $btnEntrar = $frmLogin.Designer.Controls.Add("Forms.CommandButton.1", "btnEntrar")
    $btnEntrar.Caption = "Entrar"
    $btnEntrar.Left = 50
    $btnEntrar.Top = 95
    $btnEntrar.Width = 80
    $btnEntrar.Height = 25
    Set-ControlProperty $btnEntrar "Default" $true
    
    $btnCancelar = $frmLogin.Designer.Controls.Add("Forms.CommandButton.1", "btnCancelar")
    $btnCancelar.Caption = "Cancelar"
    $btnCancelar.Left = 150
    $btnCancelar.Top = 95
    $btnCancelar.Width = 80
    $btnCancelar.Height = 25
    Set-ControlProperty $btnCancelar "Cancel" $true
    
    # Load Login code
    $loginLines = Get-Content "$vbaSourcePath\Form_Login.frm"
    $loginCode = @()
    $skip = $true
    foreach ($line in $loginLines) {
        if ($line.Trim().StartsWith("'")) { $skip = $false }
        elseif ($line.StartsWith("Private Sub") -or $line.StartsWith("Public Sub") -or $line.StartsWith("Dim ")) { $skip = $false }
        if (-not $skip) { $loginCode += $line }
    }
    $loginCodeText = $loginCode -join "`r`n"
    $frmLogin.CodeModule.DeleteLines(1, $frmLogin.CodeModule.CountOfLines)
    $frmLogin.CodeModule.AddFromString($loginCodeText)
    
    # 7. Draw shapes and buttons on CADASTRO sheet
    Write-Output "Drawing interactive buttons and photo frame on CADASTRO sheet..."
    $wsCad = $workbook.Worksheets.Item("CADASTRO")
    
    # Clean previous shapes
    foreach ($shp in $wsCad.Shapes) {
        $shp.Delete()
    }
    
    # Draw photo frame "imgFoto" over K8:O15
    $rangeK8 = $wsCad.Range("K8:O15")
    $imgFoto = $wsCad.Shapes.AddShape(1, $rangeK8.Left, $rangeK8.Top, $rangeK8.Width, $rangeK8.Height)
    $imgFoto.Name = "imgFoto"
    $imgFoto.Fill.Solid()
    $imgFoto.Fill.ForeColor.RGB = 14869232 # Grey #E2E8F0 (BGR: 240 + 232*256 + 226*65536 = 14869232)
    $imgFoto.Line.ForeColor.RGB = 13356501 # Border #CBD5E1 (BGR: 225 + 213*256 + 203*65536 = 13356501)
    $imgFoto.Line.Weight = 1
    
    # Draw actions buttons (Row 38:39)
    # Green = 8499472, Blue = 16155195, Red = 4474095, Grey = 8417900, Dark Slate = 3877150
    DrawButton $wsCad "E38:F39" "BtnNovo" "+ Novo Registro" "Mod_Cadastro.NovoFuncionario" 8499472
    DrawButton $wsCad "H38:I39" "BtnSalvar" "Salvar Ficha" "Mod_Cadastro.SalvarFuncionario" 16155195
    DrawButton $wsCad "K38:L39" "BtnExcluir" "Excluir Registro" "Mod_Cadastro.ExcluirFuncionario" 4474095
    DrawButton $wsCad "N38:O39" "BtnLimpar" "Limpar Tela" "Mod_Cadastro.LimparCamposCompleto" 8417900
    
    # Photo buttons
    DrawButton $wsCad "K14:L14" "BtnInserirFoto" "Inserir Foto" "Mod_Cadastro.InserirFoto" 3877150
    DrawButton $wsCad "M14:N14" "BtnRemoverFoto" "Remover Foto" "Mod_Cadastro.RemoverFoto" 3877150
    
    # 8. Draw buttons on RELATORIOS sheet
    Write-Output "Drawing buttons on RELATORIOS sheet..."
    $wsRel = $workbook.Worksheets.Item("RELATORIOS")
    foreach ($shp in $wsRel.Shapes) {
        $shp.Delete()
    }
    # Navy = 6108699, Green = 8499472, Grey = 8417900
    DrawButton $wsRel "E14:G15" "BtnFicha" "Exportar Ficha (PDF)" "Mod_Relatorios.BtnExportarFicha" 6108699
    DrawButton $wsRel "J14:L15" "BtnAtivos" "Relatorio Funcionarios" "Mod_Relatorios.BtnRelatorioAtivos" 8417900
    
    DrawButton $wsRel "E17:G18" "BtnAfastamentos" "Relatorio Afastamentos" "Mod_Relatorios.BtnRelatorioAfastamentos" 8417900
    DrawButton $wsRel "J17:L18" "BtnPenalidades" "Relatorio Penalidades" "Mod_Relatorios.BtnRelatorioPenalidades" 8417900
    
    DrawButton $wsRel "E20:G21" "BtnHoras" "Relatorio Horas Extras" "Mod_Relatorios.BtnRelatorioHorasExtras" 8417900
    DrawButton $wsRel "J20:L21" "BtnTudo" "Exportar Pasta Completa" "Mod_Relatorios.BtnExportarTudo" 8499472
    
    # 9. Setup worksheet event listeners (sidebar navigation)
    Write-Output "Injecting event listeners to worksheets..."
    $eventsCode = Get-Content "$vbaSourcePath\Worksheet_Events.txt" -Raw
    
    $cadastroEventsCode = @"
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    If Target.Count > 1 Then Exit Sub
    
    ' Clique na barra lateral
    If Target.Column >= 1 And Target.Column <= 3 And Target.Row >= 5 And Target.Row <= 22 Then
        Application.EnableEvents = False
        On Error GoTo Fim
        
        Select Case Target.Row
            Case 5: ThisWorkbook.Worksheets("DASHBOARD").Select
            Case 7: ThisWorkbook.Worksheets("CADASTRO").Select
            Case 9: ThisWorkbook.Worksheets("AFASTAMENTOS").Select
            Case 11: ThisWorkbook.Worksheets("DISCIPLINAR").Select
            Case 13: ThisWorkbook.Worksheets("HORAS_EXTRAS").Select
            Case 15: ThisWorkbook.Worksheets("RELATORIOS").Select
            Case 22: Call Mod_Seguranca.Logoff
        End Select
        
Fim:
        If ActiveSheet.Name <> "LOGOFF" And Err.Number = 0 Then
            ActiveSheet.Range("E2").Select
        End If
        Application.EnableEvents = True
    End If
End Sub

Private Sub Worksheet_Change(ByVal Target As Range)
    ' Busca automatica ao alterar F5 (CPF ou Codigo)
    If Not Intersect(Target, Range("F5")) Is Nothing Then
        Dim val As String
        val = Trim(Range("F5").Value)
        If val <> "" Then
            Call Mod_Cadastro.CarregarFuncionario(val)
        End If
    End If
End Sub
"@

    foreach ($sheet in $workbook.Sheets) {
        if (-not ($sheet.Name -like "DB_*")) {
            Write-Output "Injecting event listener in sheet: $($sheet.Name) ($($sheet.CodeName))..."
            $sheetComp = $vbProject.VBComponents.Item($sheet.CodeName)
            $sheetComp.CodeModule.DeleteLines(1, $sheetComp.CodeModule.CountOfLines)
            
            if ($sheet.Name -eq "CADASTRO") {
                $sheetComp.CodeModule.AddFromString($cadastroEventsCode)
            } else {
                $sheetComp.CodeModule.AddFromString($eventsCode)
            }
        }
    }
    
    # 10. Inject workbook startup events (ThisWorkbook)
    Write-Output "Injecting workbook startup events..."
    $wbLines = Get-Content "$vbaSourcePath\ThisWorkbook.cls"
    $wbCode = @()
    $skip = $true
    foreach ($line in $wbLines) {
        if ($line -like "*Workbook_Open*") { $skip = $false }
        if (-not $skip) { $wbCode += $line }
    }
    $wbCodeText = $wbCode -join "`r`n"
    
    $sheetCodeNames = $workbook.Sheets | ForEach-Object { $_.CodeName }
    $wbComp = $vbProject.VBComponents | Where-Object { $_.Type -eq 100 -and $_.Name -notin $sheetCodeNames }
    Write-Output "Workbook document component found: $($wbComp.Name)"
    $wbComp.CodeModule.DeleteLines(1, $wbComp.CodeModule.CountOfLines)
    $wbComp.CodeModule.AddFromString($wbCodeText)
    
    # 11. Save and Close Excel
    Write-Output "Assembly successfully completed! Saving and closing Excel..."
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
    Write-Output "Workbook assembling (v2) completed successfully! File is saved at: $finalFile"
    
} catch {
    Write-Error "An error occurred during build: $_"
    
    if ($null -ne $workbook) {
        try { $workbook.Close($false) } catch {}
    }
    if ($null -ne $excel) {
        try { $excel.Quit() } catch {}
    }
    
    Restore-Registry
    exit 1
}
