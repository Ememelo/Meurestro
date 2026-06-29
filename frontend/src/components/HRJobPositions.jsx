import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Plus, Edit2, Trash2, ShieldAlert, Briefcase, Check, X, AlertCircle } from 'lucide-react'

const HRJobPositions = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form State
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_salary: '',
    level: 'Auxiliar',
    sector_id: '',
    is_active: true
  })

  const canEdit = user?.role === 'admin' || user?.role === 'admin_delegado' || user?.hr_access === 'write' || (user?.role === 'rh' && (!user?.hr_access || user?.hr_access === 'write'))

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobsRes, sectorsRes] = await Promise.all([
        api.get('/job-positions'),
        api.get('/sectors')
      ])
      setJobs(jobsRes.data)
      setSectors(sectorsRes.data.filter(s => s.is_active))
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar dados de cargos e setores.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Automatically select the first active sector if sector_id is empty and sectors exist
  useEffect(() => {
    if (sectors.length > 0 && !formData.sector_id) {
      setFormData(prev => ({ ...prev, sector_id: sectors[0].id }))
    }
  }, [sectors])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canEdit) return

    const payload = {
      ...formData,
      base_salary: parseFloat(formData.base_salary)
    }

    try {
      if (editingId) {
        await api.put(`/job-positions/${editingId}`, payload)
        alert('Cargo atualizado com sucesso!')
      } else {
        await api.post('/job-positions', payload)
        alert('Cargo criado com sucesso!')
      }
      setFormData({
        name: '',
        description: '',
        base_salary: '',
        level: 'Auxiliar',
        sector_id: sectors[0]?.id || '',
        is_active: true
      })
      setShowForm(false)
      setEditingId(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao salvar o cargo.')
    }
  }

  const handleEdit = (job) => {
    setEditingId(job.id)
    setFormData({
      name: job.name,
      description: job.description || '',
      base_salary: String(job.base_salary),
      level: job.level || 'Auxiliar',
      sector_id: job.sector_id || sectors[0]?.id || '',
      is_active: job.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id, name) => {
    if (!canEdit) return
    if (window.confirm(`Tem certeza que deseja excluir o cargo "${name}"? Colaboradores vinculados a este cargo poderão ter inconsistências.`)) {
      try {
        await api.delete(`/job-positions/${id}`)
        alert('Cargo excluído com sucesso!')
        fetchData()
      } catch (err) {
        alert(err.response?.data?.detail || 'Erro ao excluir o cargo.')
      }
    }
  }

  const formatBRL = (val) => {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cargos</h1>
          <p className="text-sm text-slate-500">Cadastre e controle os cargos, níveis salariais e atribuições de setores.</p>
        </div>
        {canEdit && !showForm && (
          <button
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                base_salary: '',
                level: 'Auxiliar',
                sector_id: sectors[0]?.id || '',
                is_active: true
              })
              setEditingId(null)
              setShowForm(true)
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-900/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Cargo
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm max-w-xl animate-fadeIn">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Cargo' : 'Cadastrar Novo Cargo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label font-bold text-slate-700 text-xs block mb-1">Nome do Cargo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Cozinheiro, Garçom, Caixa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="form-label font-bold text-slate-700 text-xs block mb-1">Setor Responsável</label>
                {sectors.length === 0 ? (
                  <div className="text-xs text-red-500 font-bold py-2">Cadastre um setor ativo antes de criar um cargo!</div>
                ) : (
                  <select
                    value={formData.sector_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, sector_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label font-bold text-slate-700 text-xs block mb-1">Salário Base (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.base_salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_salary: e.target.value }))}
                  placeholder="Ex: 2500.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="form-label font-bold text-slate-700 text-xs block mb-1">Nível</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="Auxiliar">Auxiliar</option>
                  <option value="Júnior">Júnior</option>
                  <option value="Pleno">Pleno</option>
                  <option value="Sênior">Sênior</option>
                  <option value="Liderança">Liderança / Supervisão</option>
                  <option value="Diretoria">Diretoria / Gerência</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label font-bold text-slate-700 text-xs block mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Principais atribuições, pré-requisitos e responsabilidades..."
                rows="3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_job"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="is_active_job" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                Cargo Ativo (Disponível para admissões)
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={sectors.length === 0}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Cargo
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

      {/* Jobs list */}
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
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Nenhum cargo cadastrado</h3>
            <p className="text-xs mt-1">Clique em "Novo Cargo" para iniciar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-4">Nome do Cargo</th>
                  <th className="px-6 py-4">Setor</th>
                  <th className="px-6 py-4">Nível</th>
                  <th className="px-6 py-4">Salário Base</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  {canEdit && <th className="px-6 py-4 text-center w-28">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{job.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{job.sector?.name || 'Sem setor'}</td>
                    <td className="px-6 py-4 text-slate-500">{job.level || 'Auxiliar'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatBRL(job.base_salary)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${
                        job.is_active 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {job.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Editar Cargo"
                            onClick={() => handleEdit(job)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Excluir Cargo"
                            onClick={() => handleDelete(job.id, job.name)}
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

export default HRJobPositions
