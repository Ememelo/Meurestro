import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { FileSpreadsheet, Download, Info, CheckCircle2, User, HelpCircle } from 'lucide-react'
import SearchableSelect from './SearchableSelect'

const Reports = () => {
  const [downloading, setDownloading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Employee Dossier state
  const [employees, setEmployees] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [dossierDownloading, setDossierDownloading] = useState(false)
  const [dossierSuccess, setDossierSuccess] = useState(false)

  // Fetch employees list for dossier dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees')
        setEmployees(res.data)
        if (res.data.length > 0) {
          setSelectedEmployeeId(res.data[0].id)
        }
      } catch (err) {
        console.error('Falha ao carregar colaboradores para relatórios:', err)
      }
    }
    fetchEmployees()
  }, [])

  const handleDownloadExcel = async () => {
    setDownloading(true)
    setSuccess(false)
    try {
      const res = await api.get('/reports/excel', { responseType: 'blob' })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'relatorio_consolidado_meuresto.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setDownloading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (e) {
      setDownloading(false)
      alert('Falha ao baixar relatório consolidado.')
    }
  }

  const handleDownloadDossier = async () => {
    if (!selectedEmployeeId) {
      alert('Por favor, selecione um colaborador.')
      return
    }
    setDossierDownloading(true)
    setDossierSuccess(false)
    try {
      const selectedEmp = employees.find(e => e.id === selectedEmployeeId)
      const empName = selectedEmp ? selectedEmp.name.replace(/\s+/g, '_') : 'colaborador'
      
      const res = await api.get(`/reports/employee/${selectedEmployeeId}/excel`, { responseType: 'blob' })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dossie_${empName}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setDossierDownloading(false)
      setDossierSuccess(true)
      setTimeout(() => setDossierSuccess(false), 5000)
    } catch (e) {
      setDossierDownloading(false)
      alert('Falha ao baixar o dossiê do colaborador.')
    }
  }

  const reportsDescription = [
    { title: 'Aba 1: Colaboradores', desc: 'Dados cadastrais mestre (Matrícula, Nome, CPF, RG, Nascimento, Telefone, Email, Cargo, Setor, Salário e Status atual).' },
    { title: 'Aba 2: Histórico Funcional', desc: 'Trilha completa e imutável de promoções, reajustes salariais e transferências de setor por colaborador com data e justificativa.' },
    { title: 'Aba 3: Histórico Disciplinar', desc: 'Registro formal de advertências, suspensões e penalidades com motivos, datas e gestores responsáveis pela aplicação.' },
    { title: 'Aba 4: Afastamentos', desc: 'Acompanhamento detalhado de licenças médicas, férias e afastamentos temporários.' }
  ]

  const dossierDescription = [
    { title: 'Cadastro Geral', desc: 'Dados cadastrais detalhados, filiação, endereço, dados bancários e lista de dependentes.' },
    { title: 'Contrato e Jornada', desc: 'Cargo, salário base, nível, escala e horários de entrada/saída.' },
    { title: 'Histórico de Alterações', desc: 'Linha do tempo de todas as alterações salariais, mudanças de setor ou atualizações de dados.' },
    { title: 'Afastamentos e Ocorrências', desc: 'Licenças médicas, atestados anexados, advertências e suspensões aplicadas.' }
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Relatórios Gerenciais</h1>
        <p className="text-xs text-slate-400 mt-1">Exporte planilhas completas e relatórios gerenciais consolidados do departamento pessoal.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Card 1: Consolidated Excel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Planilha Consolidada da Unidade</h2>
                <p className="text-[11px] text-slate-400">Exportação unificada em formato `.xlsx` de todos os colaboradores.</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" /> Abas inclusas no arquivo:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportsDescription.map((rep, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{rep.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{rep.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
            <button
              onClick={handleDownloadExcel}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-650 hover:bg-emerald-600 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Gerando Planilha...' : 'Exportar Dados Gerais'}
            </button>
            
            {success && (
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                Sucesso!
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Individual Employee Dossier */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Dossiê de Colaborador</h2>
                <p className="text-[11px] text-slate-400">Gere a ficha cadastral completa com o histórico do funcionário.</p>
              </div>
            </div>

            {/* Selection Dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Selecione o Colaborador</label>
              {employees.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">Carregando lista de funcionários...</div>
              ) : (
                <SearchableSelect
                  options={employees.map(emp => ({
                    value: emp.id,
                    label: `${emp.registration_number} - ${emp.name} (${emp.status === 'active' ? 'Ativo' : 'Desligado'})`
                  }))}
                  value={selectedEmployeeId}
                  onChange={(val) => setSelectedEmployeeId(val)}
                  placeholder="Selecione ou busque o colaborador..."
                />
              )}
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" /> Informações unificadas:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dossierDescription.map((rep, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{rep.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{rep.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
            <button
              onClick={handleDownloadDossier}
              disabled={dossierDownloading || !selectedEmployeeId}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              {dossierDownloading ? 'Processando...' : 'Exportar Dossiê Completo'}
            </button>
            
            {dossierSuccess && (
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                Pronto!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
