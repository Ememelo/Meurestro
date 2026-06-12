Attribute VB_Name = "Mod_Helpers"
Public Function ValidarCPF(ByVal CPF As String) As Boolean
    Dim i As Integer
    Dim D1 As Integer, D2 As Integer
    Dim S1 As Integer, S2 As Integer
    
    CPF = Replace(Replace(CPF, ".", ""), "-", "")
    CPF = Trim(CPF)
    
    If Len(CPF) <> 11 Or Not IsNumeric(CPF) Then
        ValidarCPF = False
        Exit Function
    End If
    
    Select Case CPF
        Case "00000000000", "11111111111", "22222222222", "33333333333", _
             "44444444444", "55555555555", "66666666666", "77777777777", _
             "88888888888", "99999999999"
            ValidarCPF = False
            Exit Function
    End Select
    
    S1 = 0
    For i = 1 To 9
        S1 = S1 + CInt(Mid(CPF, i, 1)) * (11 - i)
    Next i
    D1 = 11 - (S1 Mod 11)
    If D1 >= 10 Then D1 = 0
    
    S2 = 0
    For i = 1 To 9
        S2 = S2 + CInt(Mid(CPF, i, 1)) * (12 - i)
    Next i
    S2 = S2 + D1 * 2
    D2 = 11 - (S2 Mod 11)
    If D2 >= 10 Then D2 = 0
    
    If D1 = CInt(Mid(CPF, 10, 1)) And D2 = CInt(Mid(CPF, 11, 1)) Then
        ValidarCPF = True
    Else
        ValidarCPF = False
    End If
End Function

Public Function FormatarCPF(ByVal CPF As String) As String
    CPF = Replace(Replace(CPF, ".", ""), "-", "")
    If Len(CPF) = 11 And IsNumeric(CPF) Then
        FormatarCPF = Format(CPF, "@@@.@@@.@@@-@@")
    Else
        FormatarCPF = CPF
    End If
End Function

Public Function FormatarCEP(ByVal CEP As String) As String
    CEP = Replace(CEP, "-", "")
    If Len(CEP) = 8 And IsNumeric(CEP) Then
        FormatarCEP = Format(CEP, "@@@@@-@@@")
    Else
        FormatarCEP = CEP
    End If
End Function

Public Function ValidarEmail(ByVal Email As String) As Boolean
    Dim regEx As Object
    Set regEx = CreateObject("VBScript.RegExp")
    
    With regEx
        .Pattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$"
        .IgnoreCase = True
        .Global = False
    End With
    
    ValidarEmail = regEx.Test(Email)
End Function
