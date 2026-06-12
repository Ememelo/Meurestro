# PowerShell script to fully assemble the ADV Lira Melo Excel workbook with VBA macros and UserForms.

$ErrorActionPreference = "Stop"

$projectDir = "c:\Users\esantame\OneDrive - NTT DATA EMEAL\Escritorio\Projetos Qualidade de Software (indicadores)\ADV Lira Melo (Planilha)"
$vbaSourcePath = "$projectDir\vba_source"
$baseFile = "$projectDir\ADV_Lira_Melo_Base.xlsx"
$finalFile = "$projectDir\ADV_Lira_Melo.xlsm"

Write-Output "Starting ADV Lira Melo Workbook builder script..."

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

# Helper to add a grid of fields to a page
function AddFieldsGrid($page, $fieldsList) {
    $row = 0
    $col = 0
    foreach ($field in $fieldsList) {
        $leftOffset = if ($col -eq 0) { 15 } else { 240 }
        
        # Add Label
        $lbl = $page.Controls.Add("Forms.Label.1")
        $lbl.Caption = $field.Label
        $lbl.Left = $leftOffset
        $lbl.Top = 15 + ($row * 25)
        $lbl.Width = 80
        $lbl.Height = 15
        
        # Add Control
        $controlType = if ($field.Type) { $field.Type } else { "TextBox" }
        $progId = switch ($controlType) {
            "TextBox" { "Forms.TextBox.1" }
            "ComboBox" { "Forms.ComboBox.1" }
            "CheckBox" { "Forms.CheckBox.1" }
            "OptionButton" { "Forms.OptionButton.1" }
            default { "Forms.TextBox.1" }
        }
        
        $ctrl = $page.Controls.Add($progId, $field.Name)
        $ctrl.Left = $leftOffset + 85
        $ctrl.Top = 13 + ($row * 25)
        $ctrl.Width = 120
        $ctrl.Height = 18
        
        if ($field.ReadOnly) {
            Set-ControlProperty $ctrl "Locked" $true
        }
        
        # Toggle column and row
        if ($col -eq 0) {
            $col = 1
        } else {
            $col = 0
            $row++
        }
    }
}

try {
    # 3. Start Excel application and open base workbook
    Write-Output "Opening base workbook: $baseFile..."
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    $workbook = $excel.Workbooks.Open($baseFile)
    
    # 4. Save workbook as macro-enabled (.xlsm)
    Write-Output "Saving workbook as Macro-Enabled: $finalFile..."
    $workbook.SaveAs($finalFile, 52) # 52 = xlOpenXMLWorkbookMacroEnabled
    
    $vbProject = $workbook.VBProject
    
    # 5. Import standard modules (.bas)
    $basFiles = @("Mod_Seguranca.bas", "Mod_Cadastro.bas", "Mod_Helpers.bas", "Mod_Alertas.bas", "Mod_Relatorios.bas")
    foreach ($basFile in $basFiles) {
        $fullPath = "$vbaSourcePath\$basFile"
        Write-Output "Importing standard module: $basFile..."
        $vbProject.VBComponents.Import($fullPath) | Out-Null
    }
    
    # 6. Create Form_Login programmatically
    Write-Output "Building Form_Login..."
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
    
    # 7. Create Form_Cadastro programmatically
    Write-Output "Building Form_Cadastro..."
    $frmCad = $vbProject.VBComponents.Add(3)
    $frmCad.Name = "Form_Cadastro"
    Set-ControlProperty $frmCad "Caption" "ADV Lira Melo - Ficha de Cadastro de Funcionario"
    Set-ControlProperty $frmCad "Width" 620
    Set-ControlProperty $frmCad "Height" 420
    
    # Sidebar Frame
    $fraMenu = $frmCad.Designer.Controls.Add("Forms.Frame.1", "fraMenu")
    $fraMenu.Left = 10
    $fraMenu.Top = 10
    $fraMenu.Width = 110
    $fraMenu.Height = 340
    Set-ControlProperty $fraMenu "Caption" ""
    
    $btnNovo = $fraMenu.Controls.Add("Forms.CommandButton.1", "btnNovo")
    $btnNovo.Caption = "+ Novo"
    $btnNovo.Left = 10
    $btnNovo.Top = 15
    $btnNovo.Width = 90
    $btnNovo.Height = 25
    
    $btnPesq = $fraMenu.Controls.Add("Forms.CommandButton.1", "btnPesquisar")
    $btnPesq.Caption = "Pesquisar"
    $btnPesq.Left = 10
    $btnPesq.Top = 50
    $btnPesq.Width = 90
    $btnPesq.Height = 25
    
    $btnUser = $fraMenu.Controls.Add("Forms.CommandButton.1", "btnUsuarios")
    $btnUser.Caption = "Usuarios"
    $btnUser.Left = 10
    $btnUser.Top = 85
    $btnUser.Width = 90
    $btnUser.Height = 25
    
    $btnSenha = $fraMenu.Controls.Add("Forms.CommandButton.1", "btnSenha")
    $btnSenha.Caption = "Senha"
    $btnSenha.Left = 10
    $btnSenha.Top = 120
    $btnSenha.Width = 90
    $btnSenha.Height = 25
    
    $btnFechar = $fraMenu.Controls.Add("Forms.CommandButton.1", "btnFechar")
    $btnFechar.Caption = "Sair"
    $btnFechar.Left = 10
    $btnFechar.Top = 295
    $btnFechar.Width = 90
    $btnFechar.Height = 25
    
    # MultiPage
    $mpg = $frmCad.Designer.Controls.Add("Forms.MultiPage.1", "mpgCadastro")
    $mpg.Left = 130
    $mpg.Top = 10
    $mpg.Width = 470
    $mpg.Height = 340
    
    $page0 = $mpg.Pages.Item(0)
    $page0.Name = "pgPessoal"
    $page0.Caption = "Dados Pessoais"
    
    $page1 = $mpg.Pages.Item(1)
    $page1.Name = "pgProfissional"
    $page1.Caption = "Dados Profissionais"
    
    $page2 = $mpg.Pages.Add("pgAcessibilidade", "Acessibilidade", 2)
    $page3 = $mpg.Pages.Add("pgDocumentos", "Documentos", 3)
    $page4 = $mpg.Pages.Add("pgBeneficios", "Beneficios", 4)
    
    # Fields Grid for Page 0 (Pessoal)
    $tab0Fields = @(
        @{ Name="txtCodigo"; Label="Codigo:"; ReadOnly=$true },
        @{ Name="txtNome"; Label="Nome Completo:" },
        @{ Name="txtRG"; Label="RG:" },
        @{ Name="txtCPF"; Label="CPF:" },
        @{ Name="txtNascimento"; Label="Data Nasc.:" },
        @{ Name="cboEstadoCivil"; Label="Estado Civil:"; Type="ComboBox" },
        @{ Name="cboSexo"; Label="Sexo:"; Type="ComboBox" },
        @{ Name="txtAltura"; Label="Altura:" },
        @{ Name="txtCEP"; Label="CEP:" },
        @{ Name="txtEndereco"; Label="Endereco:" },
        @{ Name="txtNumero"; Label="Numero:" },
        @{ Name="txtComplemento"; Label="Compl.:" },
        @{ Name="txtBairro"; Label="Bairro:" },
        @{ Name="txtCidade"; Label="Cidade:" },
        @{ Name="txtEstado"; Label="Estado:" },
        @{ Name="txtPais"; Label="Pais:" },
        @{ Name="txtMae"; Label="Nome da Mae:" },
        @{ Name="txtPai"; Label="Nome do Pai:" },
        @{ Name="txtDependentes"; Label="Dependentes:" }
    )
    AddFieldsGrid $page0 $tab0Fields
    
    # Fields Grid for Page 1 (Profissional)
    $tab1Fields = @(
        @{ Name="cboEscolaridade"; Label="Escolaridade:"; Type="ComboBox" },
        @{ Name="txtProfissao"; Label="Profissao:" },
        @{ Name="txtEmpresa"; Label="Empresa:" },
        @{ Name="txtAdmissao"; Label="Data Admissao:" },
        @{ Name="txtCargo"; Label="Cargo:" },
        @{ Name="txtArea"; Label="Area:" },
        @{ Name="txtDepto"; Label="Departamento:" },
        @{ Name="txtGestor"; Label="Gestor:" },
        @{ Name="txtSalarioInicial"; Label="Salario Inicial:" },
        @{ Name="txtRenda"; Label="Salario Atual:" },
        @{ Name="txtAtividades"; Label="Atividades:" }
    )
    AddFieldsGrid $page1 $tab1Fields
    
    # Controls for Page 2 (Acessibilidade)
    $lblDef = $page2.Controls.Add("Forms.Label.1")
    $lblDef.Caption = "Possui Deficiencia?"
    $lblDef.Left = 15; $lblDef.Top = 20; $lblDef.Width = 100; $lblDef.Height = 15
    
    $optSim = $page2.Controls.Add("Forms.OptionButton.1", "optDefSim")
    $optSim.Caption = "Sim"
    $optSim.Left = 125; $optSim.Top = 18; $optSim.Width = 50; $optSim.Height = 18
    Set-ControlProperty $optSim "GroupName" "grpDef"
    
    $optNao = $page2.Controls.Add("Forms.OptionButton.1", "optDefNao")
    $optNao.Caption = "Nao"
    $optNao.Left = 185; $optNao.Top = 18; $optNao.Width = 50; $optNao.Height = 18
    Set-ControlProperty $optNao "GroupName" "grpDef"
    
    $lblDefTipo = $page2.Controls.Add("Forms.Label.1")
    $lblDefTipo.Caption = "Tipo Deficiencia:"
    $lblDefTipo.Left = 15; $lblDefTipo.Top = 50; $lblDefTipo.Width = 90; $lblDefTipo.Height = 15
    
    $txtDefTipo = $page2.Controls.Add("Forms.TextBox.1", "txtDefTipo")
    $txtDefTipo.Left = 125; $txtDefTipo.Top = 48; $txtDefTipo.Width = 120; $txtDefTipo.Height = 18
    
    $lblObs = $page2.Controls.Add("Forms.Label.1")
    $lblObs.Caption = "Observacoes:"
    $lblObs.Left = 15; $lblObs.Top = 80; $lblObs.Width = 90; $lblObs.Height = 15
    
    $txtObs = $page2.Controls.Add("Forms.TextBox.1", "txtObs")
    $txtObs.Left = 15; $txtObs.Top = 95; $txtObs.Width = 230; $txtObs.Height = 90
    Set-ControlProperty $txtObs "MultiLine" $true
    Set-ControlProperty $txtObs "WordWrap" $true
    Set-ControlProperty $txtObs "ScrollBars" 2
    
    $lblFotoPath = $page2.Controls.Add("Forms.Label.1")
    $lblFotoPath.Caption = "Caminho da Foto:"
    $lblFotoPath.Left = 15; $lblFotoPath.Top = 200; $lblFotoPath.Width = 100; $lblFotoPath.Height = 15
    
    $txtFotoPath = $page2.Controls.Add("Forms.TextBox.1", "txtFotoPath")
    $txtFotoPath.Left = 15; $txtFotoPath.Top = 215; $txtFotoPath.Width = 230; $txtFotoPath.Height = 18
    Set-ControlProperty $txtFotoPath "Locked" $true
    
    $imgFoto = $page2.Controls.Add("Forms.Image.1", "imgFoto")
    $imgFoto.Left = 280; $imgFoto.Top = 15; $imgFoto.Width = 160; $imgFoto.Height = 150
    Set-ControlProperty $imgFoto "PictureSizeMode" 3 # fmPictureSizeModeZoom
    
    $btnIns = $page2.Controls.Add("Forms.CommandButton.1", "btnInserirFoto")
    $btnIns.Caption = "Inserir Imagem"
    $btnIns.Left = 280; $btnIns.Top = 175; $btnIns.Width = 160; $btnIns.Height = 22
    
    $btnDel = $page2.Controls.Add("Forms.CommandButton.1", "btnDeletarFoto")
    $btnDel.Caption = "Deletar Imagem"
    $btnDel.Left = 280; $btnDel.Top = 205; $btnDel.Width = 160; $btnDel.Height = 22
    
    # Fields Grid for Page 3 (Documentos)
    $tab3Fields = @(
        @{ Name="txtPIS"; Label="PIS:" },
        @{ Name="txtCTPS"; Label="CTPS:" },
        @{ Name="txtSerie"; Label="Serie:" },
        @{ Name="txtUFDoc"; Label="UF Documento:" },
        @{ Name="txtEmissaoDoc"; Label="Data Emissao:" }
    )
    AddFieldsGrid $page3 $tab3Fields
    
    # Controls for Page 4 (Beneficios)
    $chkVT = $page4.Controls.Add("Forms.CheckBox.1", "chkVT")
    $chkVT.Caption = "Vale Transporte"
    $chkVT.Left = 20; $chkVT.Top = 20; $chkVT.Width = 150; $chkVT.Height = 18
    
    $chkVR = $page4.Controls.Add("Forms.CheckBox.1", "chkVR")
    $chkVR.Caption = "Vale Refeicao"
    $chkVR.Left = 220; $chkVR.Top = 20; $chkVR.Width = 150; $chkVR.Height = 18
    
    $chkVA = $page4.Controls.Add("Forms.CheckBox.1", "chkVA")
    $chkVA.Caption = "Vale Alimentacao"
    $chkVA.Left = 20; $chkVA.Top = 50; $chkVA.Width = 150; $chkVA.Height = 18
    
    $chkPS = $page4.Controls.Add("Forms.CheckBox.1", "chkPS")
    $chkPS.Caption = "Plano de Saude"
    $chkPS.Left = 220; $chkPS.Top = 50; $chkPS.Width = 150; $chkPS.Height = 18
    
    $chkPO = $page4.Controls.Add("Forms.CheckBox.1", "chkPO")
    $chkPO.Caption = "Plano Odontologico"
    $chkPO.Left = 20; $chkPO.Top = 80; $chkPO.Width = 150; $chkPO.Height = 18
    
    $chkSV = $page4.Controls.Add("Forms.CheckBox.1", "chkSV")
    $chkSV.Caption = "Seguro de Vida"
    $chkSV.Left = 220; $chkSV.Top = 80; $chkSV.Width = 150; $chkSV.Height = 18
    
    $lblStatus = $page4.Controls.Add("Forms.Label.1")
    $lblStatus.Caption = "Status do Funcionario:"
    $lblStatus.Left = 20; $lblStatus.Top = 130; $lblStatus.Width = 120; $lblStatus.Height = 15
    
    $cboStatus = $page4.Controls.Add("Forms.ComboBox.1", "cboStatus")
    $cboStatus.Left = 150; $cboStatus.Top = 128; $cboStatus.Width = 150; $cboStatus.Height = 18
    
    # Bottom buttons
    $btnSalvar = $frmCad.Designer.Controls.Add("Forms.CommandButton.1", "btnSalvar")
    $btnSalvar.Caption = "Salvar"
    $btnSalvar.Left = 310; $btnSalvar.Top = 360; $btnSalvar.Width = 90; $btnSalvar.Height = 25
    
    $btnLimpar = $frmCad.Designer.Controls.Add("Forms.CommandButton.1", "btnLimpar")
    $btnLimpar.Caption = "Limpar"
    $btnLimpar.Left = 410; $btnLimpar.Top = 360; $btnLimpar.Width = 90; $btnLimpar.Height = 25
    
    $btnExcluir = $frmCad.Designer.Controls.Add("Forms.CommandButton.1", "btnExcluir")
    $btnExcluir.Caption = "Excluir"
    $btnExcluir.Left = 510; $btnExcluir.Top = 360; $btnExcluir.Width = 90; $btnExcluir.Height = 25
    
    # Load Cadastro code
    $cadLines = Get-Content "$vbaSourcePath\Form_Cadastro.frm"
    $cadCode = @()
    $skip = $true
    foreach ($line in $cadLines) {
        if ($line.Trim().StartsWith("'")) { $skip = $false }
        elseif ($line.StartsWith("Private Sub") -or $line.StartsWith("Public Sub") -or $line.StartsWith("Dim ")) { $skip = $false }
        if (-not $skip) { $cadCode += $line }
    }
    $cadCodeText = $cadCode -join "`r`n"
    $frmCad.CodeModule.DeleteLines(1, $frmCad.CodeModule.CountOfLines)
    $frmCad.CodeModule.AddFromString($cadCodeText)
    
    # 8. Setup Worksheet Event Listeners (Selection Change)
    Write-Output "Adding sidebar event listeners to worksheets..."
    $eventsCode = Get-Content "$vbaSourcePath\Worksheet_Events.txt" -Raw
    
    foreach ($sheet in $workbook.Sheets) {
        Write-Output "Injecting event listener in sheet: $($sheet.Name) ($($sheet.CodeName))..."
        $sheetComp = $vbProject.VBComponents.Item($sheet.CodeName)
        $sheetComp.CodeModule.DeleteLines(1, $sheetComp.CodeModule.CountOfLines)
        $sheetComp.CodeModule.AddFromString($eventsCode)
    }
    
    # 9. Setup ThisWorkbook (Workbook_Open / BeforeClose)
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
    
    # 10. Close and save
    Write-Output "VBA assembly successfully completed! Saving and closing Excel..."
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
    Write-Output "Workbook assembling completed successfully! File is saved at: $finalFile"
    
} catch {
    Write-Error "An error occurred during build: $_"
    
    # Attempt cleanup in case of crash
    if ($null -ne $workbook) {
        try { $workbook.Close($false) } catch {}
    }
    if ($null -ne $excel) {
        try { $excel.Quit() } catch {}
    }
    
    Restore-Registry
    exit 1
}
