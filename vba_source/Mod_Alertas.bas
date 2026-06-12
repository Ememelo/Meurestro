Attribute VB_Name = "Mod_Alertas"
Public Sub VerificarAlertasAutomaticos()
    Dim msg As String
    Dim tempMsg As String
    
    msg = "=========================================" & vbCrLf & _
          "   ALERTAS E NOTIFICACOES DE GESTAO - RH" & vbCrLf & _
          "=========================================" & vbCrLf & vbCrLf
          
    tempMsg = ObterAniversariantesDoMes()
    If tempMsg <> "" Then
        msg = msg & "[*] ANIVERSARIANTES DO MES:" & vbCrLf & tempMsg & vbCrLf
    Else
        msg = msg & "[*] ANIVERSARIANTES DO MES: Nenhum este mes." & vbCrLf & vbCrLf
    End If
    
    tempMsg = ObterExperienciaVencendo()
    If tempMsg <> "" Then
        msg = msg & "[!] EXPERIENCIA VENCENDO (PROXIMOS 15 DIAS):" & vbCrLf & tempMsg & vbCrLf
    End If
    
    tempMsg = ObterRetornoAfastamentos()
    If tempMsg <> "" Then
        msg = msg & "[+] RETORNO DE AFASTAMENTO (PROXIMOS 7 DIAS):" & vbCrLf & tempMsg & vbCrLf
    End If
    
    tempMsg = ObterDocumentacaoPendente()
    If tempMsg <> "" Then
        msg = msg & "[!] PENDENCIAS DE DOCUMENTOS (PIS/CTPS):" & vbCrLf & tempMsg & vbCrLf
    End If
    
    MsgBox msg, vbInformation, "Painel de Notificacoes de RH"
End Sub

Private Function ObterAniversariantesDoMes() As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim res As String
    Dim dataNasc As Variant
    Dim mesNasc As Integer, mesAtual As Integer
    
    Set ws = ThisWorkbook.Worksheets("DB_FUNCIONARIOS")
    lastRow = ws.Cells(ws.Rows.Count, 5).End(xlUp).Row
    mesAtual = Month(Date)
    res = ""
    
    For i = 2 To lastRow
        If ws.Cells(i, 52).Value = "Ativo" Then
            dataNasc = ws.Cells(i, 9).Value
            If IsDate(dataNasc) Then
                mesNasc = Month(CDate(dataNasc))
                If mesNasc = mesAtual Then
                    res = res & "- " & ws.Cells(i, 6).Value & " (Dia " & Day(CDate(dataNasc)) & ")" & vbCrLf
                End If
            End If
        End If
    Next i
    
    ObterAniversariantesDoMes = res
End Function

Private Function ObterExperienciaVencendo() As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim res As String
    Dim dataAdm As Variant
    Dim dataFimExp As Date
    Dim diasRestantes As Long
    
    Set ws = ThisWorkbook.Worksheets("DB_FUNCIONARIOS")
    lastRow = ws.Cells(ws.Rows.Count, 5).End(xlUp).Row
    res = ""
    
    For i = 2 To lastRow
        If ws.Cells(i, 52).Value = "Ativo" Then
            dataAdm = ws.Cells(i, 38).Value
            If IsDate(dataAdm) Then
                dataFimExp = DateAdd("d", 90, CDate(dataAdm))
                diasRestantes = DateDiff("d", Date, dataFimExp)
                
                If diasRestantes >= -5 And diasRestantes <= 15 Then
                    If diasRestantes < 0 Then
                        res = res & "- " & ws.Cells(i, 6).Value & " (VENCIDO HA " & Abs(diasRestantes) & " DIAS)" & vbCrLf
                    Else
                        res = res & "- " & ws.Cells(i, 6).Value & " (Vence em " & diasRestantes & " dias)" & vbCrLf
                    End If
                End If
            End If
        End If
    Next i
    
    ObterExperienciaVencendo = res
End Function

Private Function ObterRetornoAfastamentos() As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim res As String
    Dim dataRetorno As Variant
    Dim diasAteRetorno As Long
    
    Set ws = ThisWorkbook.Worksheets("DB_AFASTAMENTOS")
    lastRow = ws.Cells(ws.Rows.Count, 5).End(xlUp).Row
    res = ""
    
    If lastRow <= 1 Then
        ObterRetornoAfastamentos = ""
        Exit Function
    End If
    
    For i = 2 To lastRow
        If ws.Cells(i, 11).Value <> "Retornado" Then
            dataRetorno = ws.Cells(i, 8).Value
            If IsDate(dataRetorno) Then
                diasAteRetorno = DateDiff("d", Date, CDate(dataRetorno))
                If diasAteRetorno >= 0 And diasAteRetorno <= 7 Then
                    res = res & "- " & ws.Cells(i, 6).Value & " (Retorna em " & diasAteRetorno & " dias: " & Format(dataRetorno, "dd/mm") & ")" & vbCrLf
                End If
            End If
        End If
    Next i
    
    ObterRetornoAfastamentos = res
End Function

Private Function ObterDocumentacaoPendente() As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim res As String
    Dim pis As String, ctps As String
    
    Set ws = ThisWorkbook.Worksheets("DB_FUNCIONARIOS")
    lastRow = ws.Cells(ws.Rows.Count, 5).End(xlUp).Row
    res = ""
    
    For i = 2 To lastRow
        If ws.Cells(i, 52).Value = "Ativo" Then
            pis = Trim(ws.Cells(i, 33).Value)
            ctps = Trim(ws.Cells(i, 34).Value)
            If pis = "" Or ctps = "" Then
                res = res & "- " & ws.Cells(i, 6).Value & " (" & ws.Cells(i, 5).Value & ")" & vbCrLf
            End If
        End If
    Next i
    
    ObterDocumentacaoPendente = res
End Function
