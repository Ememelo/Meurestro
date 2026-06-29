import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Plus, Edit2, Trash2, ShieldAlert, FolderKanban, Check, X, AlertCircle } from 'lucide-react'

const HRSectors = () => {
  const { user } = useAuth()
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form State
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  })

  const canEdit = user?.role === 'admin' || user?.role === 'admin_delegado' || user?.hr_access === 'write' || (user?.role === 'rh' && (!user?.hr_access || user?.hr_access === 'write'))

  const fetchSectors = async () => {
    setLoading(true)
    try {
      const res = await api.get('/sectors')
      setSectors(res.data)
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar os setores.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSectors()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canEdit) return

    try {
      if (editingId) {
        await api.put(`/sectors/${editingId}`, formData)
        alert('Setor atualizado com sucesso!')
      } else {
        await api.post('/sectors', formData)
        alert('Setor criado com sucesso!')
      }
      setFormData({ name: '', description: '', is_active: true })
      setShowForm(false)
      setEditingId(null)
      fetchSectors()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao salvar o setor.')
    }
  }

  const handleEdit = (sector) => {
    setEditingId(sector.id)
    setFormData({
      name: sector.name,
      description: sector.description || '',
      is_active: sector.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id, name) => {
    if (!canEdit) return
    if (window.confirm(`Tem certeza que deseja excluir o setor "${name}"? Colaboradores e cargos associados poderão ficar sem setor.`)) {
      try {
        await api.delete(`/sectors/${id}`)
        alert('Setor excluído com sucesso!')
        fetchSectors()
      } catch (err) {
        alert(err.response?.data?.detail || 'Erro ao excluir o setor.')
      }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Setores</h1>
          <p className="text-sm text-slate-500">Cadastre e gerencie os setores organizacionais do restaurante.</p>
        </div>
        {canEdit && !showForm && (
          <button
            onClick={() => {
              setFormData({ name: '', description: '', is_active: true })
              setEditingId(null)
              setShowForm(true)
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-900/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Setor
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm max-w-xl animate-fadeIn">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Setor' : 'Cadastrar Novo Setor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label font-bold text-slate-700 text-xs block mb-1">Nome do Setor</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Cozinha, Atendimento, Caixa, Delivery"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="form-label font-bold text-slate-700 text-xs block mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva as responsabilidades ou observações deste setor..."
                rows="3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_sector"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="is_active_sector" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                Setor Ativo (Disponível para seleção)
              </label>
            </div>
            
            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Setor
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

      {/* Sectors list */}
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
        ) : sectors.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Nenhum setor cadastrado</h3>
            <p className="text-xs mt-1">Clique em "Novo Setor" para iniciar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-4">Nome do Setor</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  {canEdit && <th className="px-6 py-4 text-center w-28">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectors.map((sec) => (
                  <tr key={sec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{sec.name}</td>
                    <td className="px-6 py-4 text-slate-500">{sec.description || 'Sem descrição.'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${
                        sec.is_active 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {sec.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Editar Setor"
                            onClick={() => handleEdit(sec)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Excluir Setor"
                            onClick={() => handleDelete(sec.id, sec.name)}
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

export default HRSectors
