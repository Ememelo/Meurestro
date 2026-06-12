Attribute VB_Name = "Mod_Cadastro"
Public Sub CarregarFuncionario(ByVal termo As String)
    Dim wsDb As Worksheet
    Dim wsCad As Worksheet
    Dim r As Long, lastRow As Long
    Dim encontrado As Boolean
    Dim arr() As String
    
    Set wsDb = ThisWorkbook.Worksheets("DB_FUNCIONARIOS")
    Set wsCad = ThisWorkbook.Worksheets("CADASTRO")
    
    termo = Trim(termo)
    If termo = "" Then Exit Sub
    
    lastRow = wsDb.Cells(wsDb.Rows.Count, 5).End(xlUp).Row
    encontrado = False
    
    For r = 2 To lastRow
        If LCase(wsDb.Cells(r, 5).Value) = LCase(termo) Or Replace(Replace(wsDb.Cells(r, 8).Value, ".", ""), "-", "") = Replace(Replace(termo, ".", ""), "-", "") Then
            encontrado = True
            Exit For
        End If
    Next r
    
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    
    If encontrado Then
        ' Limpar campos primeiro
        Call LimparCamposSilencioso
        
        ' Preencher campos na planilha CADASTRO
        wsCad.Range("F8").Value = wsDb.Cells(r, 5).Value ' Codigo
        wsCad.Range("F9").Value = wsDb.Cells(r, 6).Value ' Nome
        wsCad.Range("F10").Value = wsDb.Cells(r, 7).Value ' RG
        wsCad.Range("F11").Value = wsDb.Cells(r, 8).Value ' CPF
        wsCad.Range("F12").Value = wsDb.Cells(r, 9).Value ' Nascimento
        wsCad.Range("F13").Value = wsDb.Cells(r, 10).Value ' Estado Civil
        wsCad.Range("F14").Value = wsDb.Cells(r, 28).Value ' Sexo
        wsCad.Range("F15").Value = wsDb.Cells(r, 12).Value ' Telefone
        wsCad.Range("F16").Value = wsDb.Cells(r, 11).Value ' E-mail
        wsCad.Range("F17").Value = wsDb.Cells(r, 19).Value ' CEP
        wsCad.Range("F18").Value = wsDb.Cells(r, 13).Value ' Endereco
        
        Dim num As String, compl As String
        num = wsDb.Cells(r, 14).Value
        compl = wsDb.Cells(r, 15).Value
        If compl <> "" Then
            wsCad.Range("F19").Value = num & " / " & compl
        Else
            wsCad.Range("F19").Value = num
        End If
        
        wsCad.Range("F20").Value = wsDb.Cells(r, 16).Value ' Bairro
        wsCad.Range("F21").Value = wsDb.Cells(r, 17).Value ' Cidade
        wsCad.Range("F22").Value = wsDb.Cells(r, 18).Value & " / " & wsDb.Cells(r, 27).Value ' Estado/Pais
        wsCad.Range("F23").Value = wsDb.Cells(r, 20).Value ' Mae
        wsCad.Range("F24").Value = wsDb.Cells(r, 21).Value ' Pai
        wsCad.Range("F25").Value = wsDb.Cells(r, 22).Value ' Dependentes
        
        ' Direita
        wsCad.Range("L16").Value = wsDb.Cells(r, 23).Value ' Def
        wsCad.Range("L17").Value = wsDb.Cells(r, 24).Value ' DefTipo
        wsCad.Range("L18").Value = wsDb.Cells(r, 30).Value ' Escolaridade
        wsCad.Range("L19").Value = wsDb.Cells(r, 39).Value ' Cargo
        wsCad.Range("L20").Value = wsDb.Cells(r, 40).Value & " / " & wsDb.Cells(r, 41).Value ' Area/Depto
        wsCad.Range("L21").Value = wsDb.Cells(r, 42).Value ' Gestor
        wsCad.Range("L22").Value = wsDb.Cells(r, 38).Value ' Admissao
        wsCad.Range("L23").Value = wsDb.Cells(r, 44).Value ' SalIni
        wsCad.Range("L24").Value = wsDb.Cells(r, 45).Value ' SalAtu
        wsCad.Range("L25").Value = wsDb.Cells(r, 33).Value ' PIS
        wsCad.Range("L26").Value = wsDb.Cells(r, 34).Value & " / " & wsDb.Cells(r, 35).Value & " / " & wsDb.Cells(r, 36).Value ' CTPS/Serie/UF
        wsCad.Range("L27").Value = wsDb.Cells(r, 52).Value ' Status
        
        ' Beneficios
        wsCad.Range("F31").Value = wsDb.Cells(r, 46).Value
        wsCad.Range("F32").Value = wsDb.Cells(r, 47).Value
        wsCad.Range("F33").Value = wsDb.Cells(r, 48).Value
        wsCad.Range("F34").Value = wsDb.Cells(r, 49).Value
        wsCad.Range("F35").Value = wsDb.Cells(r, 50).Value
        wsCad.Range("F36").Value = wsDb.Cells(r, 51).Value
        wsCad.Range("K31").Value = wsDb.Cells(r, 26).Value ' Obs
        
        ' Foto
        wsCad.Range("E39").Value = wsDb.Cells(r, 25).Value
        Call AtualizarFotoShape(wsDb.Cells(r, 25).Value)
        
        wsCad.Range("J5").Value = "Ficha de " & wsDb.Cells(r, 6).Value & " carregada com sucesso!"
        wsCad.Range("J5").Font.Color = RGB(16, 185, 129)
    Else
        Call LimparCamposSilencioso
        wsCad.Range("J5").Value = "Erro: Colaborador nao localizado!"
        wsCad.Range("J5").Font.Color = RGB(239, 68, 68)
    End If
    
    Application.EnableEvents = True
    Application.ScreenUpdating = True
End Sub

Public Sub SalvarFuncionario()
    Dim wsDb As Worksheet
    Dim wsCad As Worksheet
    Dim codigo As String, nome As String, cpf As String
    Dim r As Long, lastRow As Long
    Dim encontrado As Boolean
    Dim arr() As String
    
    Set wsDb = ThisWorkbook.Worksheets("DB_FUNCIONARIOS")
    Set wsCad = ThisWorkbook.Worksheets("CADASTRO")
    
    codigo = Trim(wsCad.Range("F8").Value)
    nome = Trim(wsCad.Range("F9").Value)
    cpf = Trim(wsCad.Range("F11").Value)
    
    If nome = "" Then
        wsCad.Range("J5").Value = "Erro: O Nome Completo e obrigatorio!"
        wsCad.Range("J5").Font.Color = RGB(239, 68, 68)
        Exit Sub
    End If
    
    If cpf = "" Then
        wsCad.Range("J5").Value = "Erro: O CPF e obrigatorio!"
        wsCad.Range("J5").Font.Color = RGB(239, 68, 68)
        Exit Sub
    End If
    
    If Not Mod_Helpers.ValidarCPF(cpf) Then
        wsCad.Range("J5").Value = "Erro: CPF digitado e invalido!"
        wsCad.Range("J5").Font.Color = RGB(239, 68, 68)
        Exit Sub
    End If
    
    ' Gerar codigo se vazio
    If codigo = "" Then
        codigo = ObterProximoCodigo()
        wsCad.Range("F8").Value = codigo
    End If
    
    lastRow = wsDb.Cells(wsDb.Rows.Count, 5).End(xlUp).Row
    encontrado = False
    
    For r = 2 To lastRow
        If wsDb.Cells(r, 5).Value = codigo Then
            encontrado = True
            Exit For
        End If
    Next r
    
    If Not encontrado Then
        r = lastRow + 1
        wsDb.Cells(r, 5).Value = codigo
    End If
    
    Application.ScreenUpdating = False
    
    ' Gravar dados no banco oculto
    wsDb.Cells(r, 6).Value = wsCad.Range("F9").Value ' Nome
    wsDb.Cells(r, 7).Value = wsCad.Range("F10").Value ' RG
    wsDb.Cells(r, 8).Value = wsCad.Range("F11").Value ' CPF
    wsDb.Cells(r, 9).Value = wsCad.Range("F12").Value ' Nasc
    wsDb.Cells(r, 10).Value = wsCad.Range("F13").Value ' Est Civil
    wsDb.Cells(r, 28).Value = wsCad.Range("F14").Value ' Sexo
    wsDb.Cells(r, 12).Value = wsCad.Range("F15").Value ' Tel
    wsDb.Cells(r, 11).Value = wsCad.Range("F16").Value ' Email
    wsDb.Cells(r, 19).Value = wsCad.Range("F17").Value ' CEP
    wsDb.Cells(r, 13).Value = wsCad.Range("F18").Value ' Endereco
    
    ' Split Numero / Compl
    arr = Split(wsCad.Range("F19").Value, " / ")
    If UBound(arr) >= 0 Then wsDb.Cells(r, 14).Value = Trim(arr(0)) Else wsDb.Cells(r, 14).Value = ""
    If UBound(arr) >= 1 Then wsDb.Cells(r, 15).Value = Trim(arr(1)) Else wsDb.Cells(r, 15).Value = ""
    
    wsDb.Cells(r, 16).Value = wsCad.Range("F20").Value ' Bairro
    wsDb.Cells(r, 17).Value = wsCad.Range("F21").Value ' Cidade
    
    ' Split Estado / Pais
    arr = Split(wsCad.Range("F22").Value, " / ")
    If UBound(arr) >= 0 Then wsDb.Cells(r, 18).Value = Trim(arr(0)) Else wsDb.Cells(r, 18).Value = ""
    If UBound(arr) >= 1 Then wsDb.Cells(r, 27).Value = Trim(arr(1)) Else wsDb.Cells(r, 27).Value = "Brasil"
    
    wsDb.Cells(r, 20).Value = wsCad.Range("F23").Value ' Mae
    wsDb.Cells(r, 21).Value = wsCad.Range("F24").Value ' Pai
    wsDb.Cells(r, 22).Value = wsCad.Range("F25").Value ' Dep
    
    ' Direita
    wsDb.Cells(r, 23).Value = wsCad.Range("L16").Value ' Def
    wsDb.Cells(r, 24).Value = wsCad.Range("L17").Value ' DefTipo
    wsDb.Cells(r, 30).Value = wsCad.Range("L18").Value ' Escolaridade
    wsDb.Cells(r, 39).Value = wsCad.Range("L19").Value ' Cargo
    
    ' Split Area / Depto
    arr = Split(wsCad.Range("L20").Value, " / ")
    If UBound(arr) >= 0 Then wsDb.Cells(r, 40).Value = Trim(arr(0)) Else wsDb.Cells(r, 40).Value = ""
    If UBound(arr) >= 1 Then wsDb.Cells(r, 41).Value = Trim(arr(1)) Else wsDb.Cells(r, 41).Value = ""
    
    wsDb.Cells(r, 42).Value = wsCad.Range("L21").Value ' Gestor
    wsDb.Cells(r, 38).Value = wsCad.Range("L22").Value ' Admissao
    wsDb.Cells(r, 44).Value = wsCad.Range("L23").Value ' SalIni
    wsDb.Cells(r, 45).Value = wsCad.Range("L24").Value ' SalAtu
    wsDb.Cells(r, 33).Value = wsCad.Range("L25").Value ' PIS
    
    ' Split CTPS / Serie / UF
    arr = Split(wsCad.Range("L26").Value, " / ")
    If UBound(arr) >= 0 Then wsDb.Cells(r, 34).Value = Trim(arr(0)) Else wsDb.Cells(r, 34).Value = ""
    If UBound(arr) >= 1 Then wsDb.Cells(r, 35).Value = Trim(arr(1)) Else wsDb.Cells(r, 35).Value = ""
    If UBound(arr) >= 2 Then wsDb.Cells(r, 36).Value = Trim(arr(2)) Else wsDb.Cells(r, 36).Value = ""
    
    wsDb.Cells(r, 52).Value = wsCad.Range("L27").Value ' Status
    
    ' Beneficios
    wsDb.Cells(r, 46).Value = wsCad.Range("F31").Value
    wsDb.Cells(r, 47).Value = wsCad.Range("F32").Value
    wsDb.Cells(r, 48).Value = wsCad.Range("F33").Value
    wsDb.Cells(r, 49).Value = wsCad.Range("F34").Value
    wsDb.Cells(r, 50).Value = wsCad.Range("F35").Value
    wsDb.Cells(r, 51).Value = wsCad.Range("F36").Value
    wsDb.Cells(r, 26).Value = wsCad.Range("K31").Value ' Obs
    wsDb.Cells(r, 25).Value = wsCad.Range("E39").Value ' Foto path
    
    ThisWorkbook.Sheets("DASHBOARD").Calculate
    
    wsCad.Range("J5").Value = "Ficha de " & nome & " salva com sucesso!"
    wsCad.Range("J5").Font.Color = RGB(16, 185, 129)
    
    Application.ScreenUpdating = True
End Sub

Public Sub ExcluirFuncionario()
    Dim wsDb As Worksheet
    Dim wsCad As Worksheet
    Dim codigo As String, nome As String
    Dim r As Long, lastRow As Long
    Dim encontrado As Boolean
    Dim confirm As VbMsgBoxResult
    
    Set wsDb = ThisWorkbook.Worksheets("DB_FUNCIONARIOS")
    Set wsCad = ThisWorkbook.Worksheets("CADASTRO")
    
    codigo = Trim(wsCad.Range("F8").Value)
    nome = Trim(wsCad.Range("F9").Value)
    
    If codigo = "" Then Exit Sub
    
    confirm = MsgBox("Deseja realmente EXCLUIR " & nome & " (" & codigo & ")?", vbQuestion + vbYesNo + vbDefaultButton2, "Excluir")
    If confirm = vbNo Then Exit Sub
    
    lastRow = wsDb.Cells(wsDb.Rows.Count, 5).End(xlUp).Row
    encontrado = False
    
    For r = 2 To lastRow
        If wsDb.Cells(r, 5).Value = codigo Then
            encontrado = True
            Exit For
        End If
    Next r
    
    If encontrado Then
        wsDb.Rows(r).Delete
        Call LimparCamposSilencioso
        wsCad.Range("J5").Value = "Colaborador excluido do sistema."
        wsCad.Range("J5").Font.Color = RGB(239, 68, 68)
        ThisWorkbook.Sheets("DASHBOARD").Calculate
    End If
End Sub

Public Sub NovoFuncionario()
    Dim wsCad As Worksheet
    Set wsCad = ThisWorkbook.Worksheets("CADASTRO")
    
    Application.EnableEvents = False
    Call LimparCamposSilencioso
    wsCad.Range("F8").Value = ObterProximoCodigo()
    wsCad.Range("L27").Value = "Ativo"
    wsCad.Range("L16").Value = "Nao"
    
    wsCad.Range("J5").Value = "Preencha a nova ficha e clique em Salvar."
    wsCad.Range("J5").Font.Color = RGB(2, 132, 199)
    Application.EnableEvents = True
End Sub

Public Sub InserirFoto()
    Dim fd As Object
    Dim fileChosen As String
    Dim wsCad As Worksheet
    Set wsCad = ThisWorkbook.Worksheets("CADASTRO")
    
    Set fd = Application.FileDialog(3)
    With fd
        .Title = "Selecione a Foto do Colaborador"
        .Filters.Clear
        .Filters.Add "Imagens", "*.jpg; *.jpeg; *.png"
        .AllowMultiSelect = False
        
        If .Show = -1 Then
            fileChosen = .SelectedItems(1)
            wsCad.Range("E39").Value = fileChosen
            Call AtualizarFotoShape(fileChosen)
            wsCad.Range("J5").Value = "Foto carregada localmente."
            wsCad.Range("J5").Font.Color = RGB(16, 185, 129)
        End If
    End With
End Sub

Public Sub RemoverFoto()
    Dim wsCad As Worksheet
    Set wsCad = ThisWorkbook.Worksheets("CADASTRO")
    
    wsCad.Range("E39").Value = ""
    Call AtualizarFotoShape("")
    wsCad.Range("J5").Value = "Foto removida."
    wsCad.Range("J5").Font.Color = RGB(71, 85, 105)
End Sub

Public Sub LimparCamposSilencioso()
    Dim wsCad As Worksheet
    Set wsCad = ThisWorkbook.Worksheets("CADASTRO")
    
    wsCad.Range("F8:H25").ClearContents
    wsCad.Range("L16:O27").ClearContents
    wsCad.Range("F31:H36").ClearContents
    wsCad.Range("K31:O36").ClearContents
    wsCad.Range("E39").Value = ""
    
    wsCad.Range("F31:F36").Value = "Nao"
    
    Call AtualizarFotoShape("")
End Sub

Public Sub LimparCamposCompleto()
    Application.EnableEvents = False
    Call LimparCamposSilencioso
    ThisWorkbook.Worksheets("CADASTRO").Range("J5").Value = "Ficha limpa."
    ThisWorkbook.Worksheets("CADASTRO").Range("J5").Font.Color = RGB(71, 85, 105)
    Application.EnableEvents = True
End Sub

Public Function ObterProximoCodigo() As String
    Dim wsDb As Worksheet
    Dim r As Long, lastRow As Long
    Dim maxId As Long, currentId As Long
    Dim idStr As String
    
    Set wsDb = ThisWorkbook.Worksheets("DB_FUNCIONARIOS")
    lastRow = wsDb.Cells(wsDb.Rows.Count, 5).End(xlUp).Row
    maxId = 0
    
    For r = 2 To lastRow
        idStr = wsDb.Cells(r, 5).Value
        If Left(idStr, 1) = "F" And IsNumeric(Mid(idStr, 2)) Then
            currentId = CLng(Mid(idStr, 2))
            If currentId > maxId Then maxId = currentId
        End If
    Next r
    
    ObterProximoCodigo = "F" & Format(maxId + 1, "0000")
End Function

Public Sub AtualizarFotoShape(ByVal caminho As String)
    Dim ws As Worksheet
    Dim shp As Shape
    Set ws = ThisWorkbook.Worksheets("CADASTRO")
    
    On Error Resume Next
    Set shp = ws.Shapes("imgFoto")
    On Error GoTo 0
    
    If shp Is Nothing Then Exit Sub
    
    If Trim(caminho) <> "" And Dir(caminho) <> "" Then
        On Error Resume Next
        shp.Fill.UserPicture caminho
        If Err.Number <> 0 Then
            shp.Fill.Solid
            shp.Fill.ForeColor.RGB = RGB(226, 232, 240)
        End If
        On Error GoTo 0
    Else
        shp.Fill.Solid
        shp.Fill.ForeColor.RGB = RGB(226, 232, 240)
    End If
End Sub
