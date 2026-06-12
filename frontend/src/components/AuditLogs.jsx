import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { ShieldCheck, Calendar, Activity, Database, AlertCircle } from 'lucide-react'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/audit')
        setLogs(response.data)
        setLoading(false)
      } catch (err) {
        setError('Erro ao carregar os logs de auditoria do sistema.')
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const getActionBadgeClass = (action) => {
    if (action.startsWith('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (action.startsWith('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (action.startsWith('DELETE') || action.startsWith('TERMINATE')) return 'bg-red-50 text-red-700 border-red-200'
    if (action.includes('LOGIN')) return 'bg-purple-50 text-purple-700 border-purple-200'
    return 'bg-slate-50 text-slate-700 border-slate-200'
  }

  // Parses the changed fields string and renders a nice clean bullet list
  const renderChangedFields = (fieldsStr) => {
    if (!fieldsStr) return <span className="text-slate-400 italic">Nenhum campo modificado</span>
    
    try {
      const data = JSON.parse(fieldsStr)
      if (typeof data !== 'object' || data === null) return <span>{String(fieldsStr)}</span>
      
      return (
        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
          {Object.keys(data).map((key) => {
            const val = data[key]
            if (Array.isArray(val) && val.length === 2) {
              return (
                <li key={key}>
                  <span className="font-bold text-slate-700">{key}</span>:{' '}
                  <span className="text-slate-500 line-through">{String(val[0])}</span>{' '}
                  <span className="text-slate-400">&rarr;</span>{' '}
                  <span className="font-semibold text-slate-800">{String(val[1])}</span>
                </li>
              )
            }
            return (
              <li key={key}>
                <span className="font-bold text-slate-700">{key}</span>: {String(val)}
              </li>
            )
          })}
        </ul>
      )
    } catch (e) {
      return <span className="text-slate-500 text-xs">{String(fieldsStr)}</span>
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Logs de Auditoria</h1>
        <p className="text-sm text-slate-500">Rastreabilidade completa e imutável de todas as modificações efetuadas no sistema.</p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Auditoria Vazia</h3>
            <p className="text-xs text-slate-400 mt-1">Nenhum evento registrado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-4">Horário / Data</th>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4 text-center">Ação Realizada</th>
                  <th className="px-6 py-4">Tabela</th>
                  <th className="px-6 py-4">Valores Modificados (Antes & Depois)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-semibold w-40 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold w-32">{log.username}</td>
                    <td className="px-6 py-4 text-center w-48">
                      <span className={`inline-block px-2.5 py-0.5 border rounded-full font-bold uppercase tracking-wider text-[10px] ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 w-32">
                      <div className="flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        {log.table_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      {renderChangedFields(log.changed_fields)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogs
