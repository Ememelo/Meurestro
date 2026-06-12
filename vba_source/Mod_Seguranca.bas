Attribute VB_Name = "Mod_Seguranca"
Public UsuarioLogado As String
Public PerfilLogado As String
Public UsuarioAutenticado As Boolean

Public Const PERFIL_ADMIN As String = "Administrador"
Public Const PERFIL_RH As String = "RH"
Public Const PERFIL_GESTOR As String = "Gestor"
Public Const PERFIL_CONSULTA As String = "Consulta"

Public Const SENHA_PLANILHA As String = "LiraMelo2026"

Public Function RealizarLogin(ByVal Usuario As String, ByVal Senha As String) As Boolean
    Usuario = LCase(Trim(Usuario))
    RealizarLogin = False
    
    If Usuario = "admin" And Senha = "admin" Then
        UsuarioLogado = "Administrador do Sistema"
        PerfilLogado = PERFIL_ADMIN
        UsuarioAutenticado = True
        RealizarLogin = True
    ElseIf Usuario = "rh" And Senha = "rh123" Then
        UsuarioLogado = "Profissional de RH"
        PerfilLogado = PERFIL_RH
        UsuarioAutenticado = True
        RealizarLogin = True
    ElseIf Usuario = "gestor" And Senha = "gestor123" Then
        UsuarioLogado = "Gestor Operacional"
        PerfilLogado = PERFIL_GESTOR
        UsuarioAutenticado = True
        RealizarLogin = True
    ElseIf Usuario = "consulta" And Senha = "consulta123" Then
        UsuarioLogado = "Visualizador Geral"
        PerfilLogado = PERFIL_CONSULTA
        UsuarioAutenticado = True
        RealizarLogin = True
    End If
    
    If RealizarLogin Then
        Call ConfigurarAcessoAbas
    End If
End Function

Public Sub Logoff()
    UsuarioLogado = ""
    PerfilLogado = ""
    UsuarioAutenticado = False
    
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> "DASHBOARD" Then
            ws.Visible = xlSheetVeryHidden
        End If
    Next ws
    
    MsgBox "Sessao encerrada com sucesso!", vbInformation, "Logoff"
    Form_Login.Show
End Sub

Public Sub ConfigurarAcessoAbas()
    Application.ScreenUpdating = False
    Dim ws As Worksheet
    
    ' Bloquear todas as abas DB para todos para preservar a visao de sistema
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name Like "DB_*" Then
            ws.Visible = xlSheetVeryHidden
            ws.Unprotect SENHA_PLANILHA
        End If
    Next ws
    
    ' Admin ou RH: Acesso total a todas as abas de interface
    If PerfilLogado = PERFIL_ADMIN Or PerfilLogado = PERFIL_RH Then
        For Each ws In ThisWorkbook.Worksheets
            If Not ws.Name Like "DB_*" Then
                ws.Visible = xlSheetVisible
                ws.Unprotect SENHA_PLANILHA
            End If
        Next ws
        
    ' Gestor: Nao tem acesso a aba de CADASTRO (dados pessoais sensiveis)
    ElseIf PerfilLogado = PERFIL_GESTOR Then
        For Each ws In ThisWorkbook.Worksheets
            If Not ws.Name Like "DB_*" Then
                Select Case ws.Name
                    Case "DASHBOARD", "AFASTAMENTOS", "DISCIPLINAR", "HORAS_EXTRAS", "RELATORIOS"
                        ws.Visible = xlSheetVisible
                        ws.Unprotect SENHA_PLANILHA
                    Case Else
                        ws.Visible = xlSheetVeryHidden
                End Select
            End If
        Next ws
        
    ' Consulta: Apenas Dashboard e Relatorios (Leitura)
    ElseIf PerfilLogado = PERFIL_CONSULTA Then
        For Each ws In ThisWorkbook.Worksheets
            If Not ws.Name Like "DB_*" Then
                Select Case ws.Name
                    Case "DASHBOARD", "RELATORIOS"
                        ws.Visible = xlSheetVisible
                        ws.Protect SENHA_PLANILHA, UserInterfaceOnly:=True
                    Case Else
                        ws.Visible = xlSheetVeryHidden
                End Select
            End If
        Next ws
    End If
    
    Application.ScreenUpdating = True
End Sub

Public Sub ProtegerPlanilha(ws As Worksheet)
    ws.Protect Password:=SENHA_PLANILHA, UserInterfaceOnly:=True, AllowFiltering:=True
End Sub

Public Sub DesprotegerPlanilha(ws As Worksheet)
    ws.Unprotect Password:=SENHA_PLANILHA
End Sub
