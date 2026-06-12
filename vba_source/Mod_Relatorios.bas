Attribute VB_Name = "Mod_Relatorios"
Public Sub ExportarFichaPDF()
    Dim wsRep As Worksheet
    Dim codigo As String, nome As String
    Dim caminhoPDF As String, nomeArquivo As String
    
    Set wsRep = ThisWorkbook.Worksheets("RELATORIOS")
    codigo = wsRep.Range("H4").Value
    nome = wsRep.Range("H7").Value
    
    If Trim(codigo) = "" Or Trim(nome) = "" Then
        MsgBox "Codigo do colaborador invalido ou ficha vazia!", vbExclamation, "Erro"
        Exit Sub
    End If
    
    nomeArquivo = "Ficha_" & codigo & "_" & Replace(nome, " ", "_") & ".pdf"
    caminhoPDF = ThisWorkbook.Path & "\" & nomeArquivo
    
    On Error GoTo TrataErro
    
    wsRep.PageSetup.PrintArea = "$E$2:$O$13"
    wsRep.PageSetup.Orientation = xlPortrait
    wsRep.PageSetup.FitToPagesWide = 1
    wsRep.PageSetup.FitToPagesTall = 1
    
    wsRep.ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=caminhoPDF, _
        Quality:=xlQualityStandard, _
        IncludeDocProperties:=True, _
        IgnorePrintAreas:=False, _
        OpenAfterPublish:=True
        
    MsgBox "Ficha exportada com sucesso em:" & vbCrLf & caminhoPDF, vbInformation, "Sucesso"
    Exit Sub
    
TrataErro:
    MsgBox "Erro ao exportar PDF: " & Err.Description, vbCritical, "Erro"
End Sub

Public Sub ExportarPlanilhaPDF(ByVal nomeAba As String, ByVal orientacaoHorizontal As Boolean)
    Dim ws As Worksheet
    Dim caminhoPDF As String, nomeArquivo As String
    Dim wasVisible As Long
    
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(nomeAba)
    On Error GoTo TrataErro
    
    If ws Is Nothing Then
        MsgBox "Aba '" & nomeAba & "' nao encontrada!", vbExclamation, "Erro"
        Exit Sub
    End If
    
    wasVisible = ws.Visible
    ws.Visible = xlSheetVisible
    
    nomeArquivo = "Relatorio_" & nomeAba & "_" & Format(Date, "yyyymmdd") & ".pdf"
    caminhoPDF = ThisWorkbook.Path & "\" & nomeArquivo
    
    With ws.PageSetup
        .PrintArea = ""
        If orientacaoHorizontal Then
            .Orientation = xlLandscape
        Else
            .Orientation = xlPortrait
        End If
        .FitToPagesWide = 1
        .FitToPagesTall = 0
    End With
    
    ws.ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=caminhoPDF, _
        Quality:=xlQualityStandard, _
        IncludeDocProperties:=True, _
        IgnorePrintAreas:=False, _
        OpenAfterPublish:=True
        
    ws.Visible = wasVisible
    MsgBox "Relatorio exportado com sucesso em:" & vbCrLf & caminhoPDF, vbInformation, "Sucesso"
    Exit Sub
    
TrataErro:
    If Not ws Is Nothing Then ws.Visible = wasVisible
    MsgBox "Erro ao exportar relatorio: " & Err.Description, vbCritical, "Erro"
End Sub

Public Sub CriarGraficosDashboard()
    Dim ws As Worksheet
    Dim shp As Shape
    Dim chArea As ChartObject, chStatus As ChartObject
    
    Set ws = ThisWorkbook.Worksheets("DASHBOARD")
    
    For Each shp In ws.Shapes
        If shp.HasChart Then shp.Delete
    Next shp
    
    ' 1. Grafico 1: Funcionarios por Area
    Set chArea = ws.ChartObjects.Add( _
        Left:=ws.Range("E10").Left, _
        Top:=ws.Range("E10").Top, _
        Width:=350, _
        Height:=190)
        
    With chArea.Chart
        .SetSourceData Source:=ws.Range("Q3:R8")
        .ChartType = xlColumnClustered
        .HasTitle = True
        .ChartTitle.Text = "Funcionarios por Area"
        .ChartTitle.Font.Name = "Segoe UI"
        .ChartTitle.Font.Size = 10
        .ChartTitle.Font.Bold = True
        .ChartTitle.Font.Color = RGB(27, 54, 93)
        .HasLegend = False
        
        .ChartArea.Format.Line.Visible = msoFalse
        .PlotArea.Format.Line.Visible = msoFalse
    End With
    
    ' 2. Grafico 2: Status de Colaboradores
    Set chStatus = ws.ChartObjects.Add( _
        Left:=ws.Range("K10").Left, _
        Top:=ws.Range("K10").Top, _
        Width:=350, _
        Height:=190)
        
    With chStatus.Chart
        .SetSourceData Source:=ws.Range("Q11:R13")
        .ChartType = xlDoughnut
        .HasTitle = True
        .ChartTitle.Text = "Status de Colaboradores"
        .ChartTitle.Font.Name = "Segoe UI"
        .ChartTitle.Font.Size = 10
        .ChartTitle.Font.Bold = True
        .ChartTitle.Font.Color = RGB(27, 54, 93)
        .HasLegend = True
        .Legend.Position = xlLegendPositionBottom
        .Legend.Font.Name = "Segoe UI"
        .Legend.Font.Size = 8
        
        .ChartArea.Format.Line.Visible = msoFalse
        .PlotArea.Format.Line.Visible = msoFalse
    End With
End Sub

Public Sub BtnExportarFicha()
    Call ExportarFichaPDF
End Sub

Public Sub BtnRelatorioAtivos()
    Call ExportarPlanilhaPDF("DB_FUNCIONARIOS", True)
End Sub

Public Sub BtnRelatorioAfastamentos()
    Call ExportarPlanilhaPDF("DB_AFASTAMENTOS", True)
End Sub

Public Sub BtnRelatorioPenalidades()
    Call ExportarPlanilhaPDF("DB_DISCIPLINAR", False)
End Sub

Public Sub BtnRelatorioHorasExtras()
    Call ExportarPlanilhaPDF("DB_HORAS_EXTRAS", False)
End Sub

Public Sub BtnExportarTudo()
    Dim caminhoPDF As String
    caminhoPDF = ThisWorkbook.Path & "\Pasta_Consolidada_LiraMelo_" & Format(Date, "yyyymmdd") & ".pdf"
    
    On Error GoTo TrataErro
    
    ThisWorkbook.ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=caminhoPDF, _
        Quality:=xlQualityStandard, _
        IncludeDocProperties:=True, _
        IgnorePrintAreas:=False, _
        OpenAfterPublish:=True
        
    MsgBox "Pasta completa exportada com sucesso em:" & vbCrLf & caminhoPDF, vbInformation, "Sucesso"
    Exit Sub
    
TrataErro:
    MsgBox "Erro ao exportar pasta completa: " & Err.Description, vbCritical, "Erro"
End Sub
