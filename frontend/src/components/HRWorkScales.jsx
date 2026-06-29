import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Plus, Edit2, Trash2, ShieldAlert, Clock, Check, X, AlertCircle } from 'lucide-react'

const HRWorkScales = () => {
  const { user } = useAuth()
  const [scales, setScales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form State
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entry_time: '09:00',
    exit_time: '18:00',
    interval_minutes: 60,
    is_active: true
  })

  const canEdit = user?.role === 'admin' || user?.role === 'admin_delegado' || user?.hr_access === 'write' || (user?.role === 'rh' && (!user?.hr_access || user?.hr_access === 'write'))

  const fetchScales = async () => {
    setLoading(true)
    try {
      const res = await api.get('/work-scales')
      setScales(res.data)
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar as escalas.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScales()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canEdit) return

    const payload = {
      ...formData,
      interval_minutes: parseInt(formData.interval_minutes)
    }

    try {
      if (editingId) {
        await api.put(`/work-scales/${editingId}`, payload)
        alert('Escala atualizada com sucesso!')
      } else {
        await api.post('/work-scales', payload)
        alert('Escala criada com sucesso!')
      }
      setFormData({ name: '', description: '', entry_time: '09:00', exit_time: '18:00', interval_minutes: 60, is_active: true })
      setShowForm(false)
      setEditingId(null)
      fetchScales()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao salvar a escala.')
    }
  }

  const handleEdit = (scale) => {
    setEditingId(scale.id)
    setFormData({
      name: scale.name,
      description: scale.description || '',
      entry_time: scale.entry_time,
      exit_time: scale.exit_time,
      interval_minutes: String(scale.interval_minutes),
      is_active: scale.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id, name) => {
    if (!canEdit) return
    if (window.confirm(`Tem certeza que deseja excluir a escala "${name}"? Colaboradores vinculados a esta escala perderão a referência de horário.`)) {
      try {
        await api.delete(`/work-scales/${id}`)
        alert('Escala excluída com sucesso!')
        fetchScales()
      } catch (err) {
        alert(err.response?.data?.detail || 'Erro ao excluir a escala.')
      }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Escalas</h1>
          <p className="text-sm text-slate-500">Defina as jornadas, horários de entrada/saída e tempos de intervalo padrão.</p>
        </div>
        {canEdit && !showForm && (
          <button
            onClick={() => {
              setFormData({ name: '', description: '', entry_time: '09:00', exit_time: '18:00', interval_minutes: 60, is_active: true })
              setEditingId(null)
              setShowForm(true)
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-900/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Escala
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm max-w-xl animate-fadeIn">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Escala' : 'Cadastrar Nova Escala'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label font-bold text-slate-700 text-xs block mb-1">Nome da Escala</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Segunda a Sexta Comercial, Escala 12x36 Noturna, Finais de Semana"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label font-bold text-slate-700 text-xs block mb-1">Entrada (HH:MM)</label>
                <input
                  type="text"
                  required
                  pattern="[0-2][0-9]:[0-5][0-9]"
                  value={formData.entry_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_time: e.target.value }))}
                  placeholder="Ex: 09:00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="form-label font-bold text-slate-700 text-xs block mb-1">Saída (HH:MM)</label>
                <input
                  type="text"
                  required
                  pattern="[0-2][0-9]:[0-5][0-9]"
                  value={formData.exit_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, exit_time: e.target.value }))}
                  placeholder="Ex: 18:00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="form-label font-bold text-slate-700 text-xs block mb-1">Intervalo (Minutos)</label>
                <input
                  type="number"
                  required
                  value={formData.interval_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, interval_minutes: e.target.value }))}
                  placeholder="Ex: 60"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="form-label font-bold text-slate-700 text-xs block mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Indique os dias da semana ou detalhes da jornada..."
                rows="2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_scale"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="is_active_scale" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                Escala Ativa (Disponível para colaboradores)
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Escala
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scales list */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : scales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Nenhuma escala cadastrada</h3>
            <p className="text-xs mt-1">Clique em "Nova Escala" para iniciar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-4">Nome da Escala</th>
                  <th className="px-6 py-4">Horário de Trabalho</th>
                  <th className="px-6 py-4">Intervalo</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  {canEdit && <th className="px-6 py-4 text-center w-28">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scales.map((scale) => (
                  <tr key={scale.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div>{scale.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{scale.description || 'Sem descrição.'}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {scale.entry_time} às {scale.exit_time}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{scale.interval_minutes} minutos</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${
                        scale.is_active 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {scale.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Editar Escala"
                            onClick={() => handleEdit(scale)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Excluir Escala"
                            onClick={() => handleDelete(scale.id, scale.name)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
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

export default HRWorkScales
