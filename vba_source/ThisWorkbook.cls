VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "ThisWorkbook"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Private Sub Workbook_Open()
    ' Ocultar atualiza??o de tela durante inicializa??o
    Application.ScreenUpdating = False
    
    ' Ocultar guias padr?o de planilhas no rodap? para simular Software
    ActiveWindow.DisplayWorkbookTabs = False
    
    ' Ocultar cabe?alhos (1,2,3 / A,B,C) no Dashboard e Relat?rios
    On Error Resume Next
    ThisWorkbook.Worksheets("DASHBOARD").Activate
    ActiveWindow.DisplayHeadings = False
    ThisWorkbook.Worksheets("RELATORIOS").Activate
    ActiveWindow.DisplayHeadings = False
    On Error GoTo 0
    
    ' Bloquear acesso a todas as planilhas (Very Hidden) exceto Dashboard
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> "DASHBOARD" Then
            ws.Visible = xlSheetVeryHidden
        End If
    Next ws
    
    ThisWorkbook.Worksheets("DASHBOARD").Activate
    Application.ScreenUpdating = True
    
    ' Exibir formul?rio de Login
    Form_Login.Show
    
    ' Se login conclu?do com sucesso
    If Mod_Seguranca.UsuarioAutenticado Then
        ' Gerar os gr?ficos din?micos modernos no Dashboard via VBA
        Call Mod_Relatorios.CriarGraficosDashboard
        ' Verificar Alertas de RH
        Call Mod_Alertas.VerificarAlertasAutomaticos
    End If
End Sub

Private Sub Workbook_BeforeClose(Cancel As Boolean)
    ' Ao fechar, restaurar padr?es de seguran?a e visibilidade
    Application.ScreenUpdating = False
    
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> "DASHBOARD" Then
            ws.Visible = xlSheetVeryHidden
        End If
    Next ws
    
    ' Mostrar guias padr?o novamente para n?o quebrar outros arquivos do usu?rio
    ActiveWindow.DisplayWorkbookTabs = True
    
    Application.ScreenUpdating = True
    ThisWorkbook.Save
End Sub
