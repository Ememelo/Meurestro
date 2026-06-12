import React, { useState } from 'react'
import api from '../utils/api'
import { FileSpreadsheet, Download, Info, CheckCircle2 } from 'lucide-react'

const Reports = () => {
  const [downloading, setDownloading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleDownloadExcel = async () => {
    setDownloading(true)
    setSuccess(false)
    try {
      // Trigger API download by opening in new tab or fetching
      // Since it requires JWT, fetching and downloading via blob is the most secure!
      const res = await api.get('/reports/excel', { responseType: 'blob' })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'relatorio_consolidado_lira_rh.xlsx')
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

  const reportsDescription = [
    { title: 'Aba 1: Colaboradores', desc: 'Dados cadastrais mestre (Matrícula, Nome, CPF, RG, Nascimento, Telefone, Email, Cargo, Setor, Salário e Status atual).' },
    { title: 'Aba 2: Histórico Funcional', desc: 'Trilha completa e imutável de promoções, reajustes salariais e transferências de setor por colaborador com data e justificativa.' },
    { title: 'Aba 3: Histórico Disciplinar', desc: 'Registro formal de advertências, suspensões e penalidades com motivos, datas e gestores responsáveis pela aplicação.' },
    { title: 'Aba 4: Afastamentos', desc: 'Acompanhamento detalhado de licenças médicas, férias e afastamentos temporários.' }
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Relatórios Gerenciais</h1>
        <p className="text-sm text-slate-500">Exporte os dados consolidados do departamento pessoal para análises no Excel.</p>
      </div>

      {/* Main Export Card */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-3xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Planilha Consolidada Lira RH</h2>
            <p className="text-xs text-slate-400">Exportação unificada em formato `.xlsx` estruturada em abas funcionais.</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" /> Estrutura do Arquivo Gerado:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportsDescription.map((rep, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-100 bg-slate-50/40">
                <h4 className="text-xs font-bold text-slate-800 mb-1">{rep.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{rep.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Gerando Planilha...' : 'Exportar Relatório Excel'}
          </button>
          
          {success && (
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              Download concluído com sucesso!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
