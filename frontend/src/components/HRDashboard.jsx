import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { 
  Users, 
  UserCheck, 
  Activity, 
  Clock, 
  Cake, 
  UserPlus, 
  UserMinus, 
  Calendar,
  FolderKanban,
  Briefcase,
  FileText,
  AlertCircle
} from 'lucide-react'

const HRDashboard = () => {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-indexed

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const monthsList = [
    { num: 1, name: 'Jan' },
    { num: 2, name: 'Fev' },
    { num: 3, name: 'Mar' },
    { num: 4, name: 'Abr' },
    { num: 5, name: 'Mai' },
    { num: 6, name: 'Jun' },
    { num: 7, name: 'Jul' },
    { num: 8, name: 'Ago' },
    { num: 9, name: 'Set' },
    { num: 10, name: 'Out' },
    { num: 11, name: 'Nov' },
    { num: 12, name: 'Dez' }
  ]

  const fetchHRDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { year, month }
      const response = await api.get('/dashboard/hr', { params })
      setData(response.data)
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar dados do dashboard de RH.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHRDashboard()
  }, [year, month])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  const { kpis, charts } = data

  const kpiCards = [
    { label: 'Total de Colaboradores', value: kpis.total_employees, icon: Users, color: 'border-l-4 border-l-amber-500' },
    { label: 'Colaboradores Ativos', value: kpis.active_employees, icon: UserCheck, color: 'border-l-4 border-l-emerald-500' },
    { label: 'Colaboradores Afastados', value: kpis.on_leave_employees, icon: Activity, color: 'border-l-4 border-l-orange-500' },
    { label: 'Colaboradores em Experiência', value: kpis.probation_employees, icon: Clock, color: 'border-l-4 border-l-purple-500' },
    { label: 'Aniversariantes do Mês', value: kpis.birthdays_this_month, icon: Cake, color: 'border-l-4 border-l-pink-500' },
    { label: 'Admissões do Mês', value: kpis.admissions_this_month, icon: UserPlus, color: 'border-l-4 border-l-cyan-500' },
    { label: 'Desligamentos do Mês', value: kpis.terminations_this_month, icon: UserMinus, color: 'border-l-4 border-l-red-500' }
  ]

  const getMaxCount = (arr) => {
    if (!arr || arr.length === 0) return 1
    return Math.max(...arr.map(item => item.count))
  }

  const maxDeptCount = charts ? getMaxCount(charts.by_department) : 1
  const maxRoleCount = charts ? getMaxCount(charts.by_role) : 1
  const maxContractCount = charts ? getMaxCount(charts.by_contract_type) : 1

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard de Recursos Humanos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Indicadores e gráficos de admissões, distribuição de colaboradores e estatísticas da equipe.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
            >
              {Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2024 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Month selector Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center overflow-x-auto max-w-full gap-0.5 scrollbar-none">
            {monthsList.map(m => (
              <button
                key={m.num}
                onClick={() => setMonth(m.num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  month === m.num 
                    ? 'bg-white text-slate-800 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div 
              key={idx} 
              className={`bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between ${kpi.color}`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                <h3 className="text-xl font-bold text-slate-800">{kpi.value}</h3>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fadeIn">
        {/* Chart 1: Departamentos */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
            <FolderKanban className="text-amber-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Colaboradores por Setor</h3>
          </div>
          
          <div className="space-y-4">
            {!charts?.by_department || charts.by_department.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Nenhum colaborador alocado.</p>
            ) : (
              charts.by_department.map((dept, idx) => {
                const pct = (dept.count / maxDeptCount) * 100
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[180px]">{dept.name}</span>
                      <span className="text-slate-500">{dept.count} colab.</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-amber-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chart 2: Cargos */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
            <Briefcase className="text-amber-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Distribuição por Cargo</h3>
          </div>
          
          <div className="space-y-4">
            {!charts?.by_role || charts.by_role.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Nenhum cargo ativo.</p>
            ) : (
              charts.by_role.map((role, idx) => {
                const pct = (role.count / maxRoleCount) * 100
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[180px]">{role.name}</span>
                      <span className="text-slate-500">{role.count} colab.</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-slate-800 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chart 3: Tipo de Contrato */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
            <FileText className="text-amber-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Regime de Contratação</h3>
          </div>
          
          <div className="space-y-4">
            {!charts?.by_contract_type || charts.by_contract_type.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Sem contratos ativos.</p>
            ) : (
              charts.by_contract_type.map((cont, idx) => {
                const pct = (cont.count / maxContractCount) * 100
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[180px]">{cont.name}</span>
                      <span className="text-slate-500">{cont.count} colab.</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRDashboard
