VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} Form_Login 
   Caption         =   "ADV Lira Melo - Acesso Restrito"
   ClientHeight    =   2400
   ClientLeft      =   45
   ClientTop       =   375
   ClientWidth     =   4000
   StartUpPosition =   1  'CenterOwner
End
Attribute VB_Name = "Form_Login"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False

' =========================================================================
' INSTRU??ES VISUAIS DE DESENHO (Desenhe no Editor de VBA do Excel):
' 1. Insira um UserForm e renomeie-o para: Form_Login
' 2. Defina o Caption para: "ADV Lira Melo - Acesso Restrito"
' 3. Adicione os seguintes controles:
'    - Label: Nome=lblUsuario, Caption="Usu?rio:"
'    - TextBox: Nome=txtUsuario
'    - Label: Nome=lblSenha, Caption="Senha:"
'    - TextBox: Nome=txtSenha, PasswordChar="*"
'    - CommandButton: Nome=btnEntrar, Caption="Entrar" (Default=True)
'    - CommandButton: Nome=btnCancelar, Caption="Cancelar" (Cancel=True)
' =========================================================================

Private Sub btnEntrar_Click()
    Dim user As String
    Dim pass As String
    Dim logado As Boolean
    
    user = Me.txtUsuario.Text
    pass = Me.txtSenha.Text
    
    If Trim(user) = "" Or Trim(pass) = "" Then
        MsgBox "Por favor, digite o usu?rio e a senha!", vbExclamation, "Campos Requeridos"
        Exit Sub
    End If
    
    ' Tentar autenticar
    logado = Mod_Seguranca.RealizarLogin(user, pass)
    
    If logado Then
        MsgBox "Bem-vindo, " & Mod_Seguranca.UsuarioLogado & "!" & vbCrLf & _
               "Perfil de Acesso: " & Mod_Seguranca.PerfilLogado, vbInformation, "Login Efetuado"
        Unload Me
    Else
        MsgBox "Usu?rio ou senha incorretos!", vbCritical, "Acesso Negado"
        Me.txtSenha.Text = ""
        Me.txtSenha.SetFocus
    End If
End Sub

Private Sub btnCancelar_Click()
    ' Cancelar fecha o Excel caso o usu?rio n?o esteja logado
    If Not Mod_Seguranca.UsuarioAutenticado Then
        MsgBox "Acesso cancelado. A planilha ser? fechada.", vbExclamation, "Acesso Cancelado"
        ThisWorkbook.Close SaveChanges:=False
    Else
        Unload Me
    End If
End Sub

Private Sub UserForm_QueryClose(Cancel As Integer, CloseMode As Integer)
    ' Impede o fechamento pelo bot?o "X" do formul?rio se o usu?rio n?o estiver autenticado
    If CloseMode = 0 And Not Mod_Seguranca.UsuarioAutenticado Then
        Cancel = True
        MsgBox "Por favor, utilize o bot?o Cancelar para sair.", vbExclamation, "Aviso"
    End If
End Sub
