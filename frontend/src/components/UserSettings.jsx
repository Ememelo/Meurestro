import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Shield, Key, UserPlus, Users, AlertCircle, CheckCircle2, Power, Eye, EyeOff } from 'lucide-react'

const UserSettings = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Password Change State
  const [pwdForm, setPwdForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPwd, setShowPwd] = useState({
    old: false,
    new: false,
    confirm: false
  })

  // User Registration State
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'consulta'
  })
  const [showRegisterPwd, setShowRegisterPwd] = useState(false)

  // User List State (Admin only)
  const [usersList, setUsersList] = useState([])
  const [fetchingUsers, setFetchingUsers] = useState(false)

  const fetchUsers = async () => {
    if (!isAdmin) return
    setFetchingUsers(true)
    try {
      const res = await api.get('/auth/users')
      setUsersList(res.data)
    } catch (err) {
      // silent fail
    } finally {
      setFetchingUsers(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers()
    }
  }, [activeTab])

  const handlePwdChangeSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setError('A nova senha e a confirmação de senha não coincidem.')
      return
    }

    if (pwdForm.new_password.length < 4) {
      setError('A nova senha deve conter no mínimo 4 caracteres.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password
      })
      setSuccess('Sua senha foi alterada com sucesso!')
      setPwdForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao alterar a senha. Verifique se a senha atual está correta.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (registerForm.password.length < 4) {
      setError('A senha deve conter no mínimo 4 caracteres.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', registerForm)
      setSuccess(`Usuário "${registerForm.username}" registrado com sucesso!`)
      setRegisterForm({ username: '', email: '', password: '', role: 'consulta' })
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao registrar novo usuário.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (targetUser) => {
    if (targetUser.username === user.username) {
      alert('Você não pode desativar seu próprio usuário.')
      return
    }
    
    if (window.confirm(`Tem certeza que deseja alterar o status do usuário ${targetUser.username}?`)) {
      try {
        await api.put(`/auth/users/${targetUser.id}/toggle-active`)
        fetchUsers()
      } catch (err) {
        alert(err.response?.data?.detail || 'Erro ao alterar status do usuário.')
      }
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      rh: 'Recursos Humanos',
      socio: 'Sócio-Diretor',
      gestor: 'Gestor de Área',
      consulta: 'Leitura/Consulta'
    }
    return labels[role] || role
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Usuários & Acesso</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie suas credenciais de segurança e contas corporativas do Lira People Management.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Navigation Card */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm h-fit space-y-2">
          <button
            onClick={() => { setActiveTab('profile'); setError(null); setSuccess(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            Minha Senha
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => { setActiveTab('register'); setError(null); setSuccess(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Usuário
              </button>

              <button
                onClick={() => { setActiveTab('users'); setError(null); setSuccess(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Gerenciar Usuários
              </button>
            </>
          )}

          <div className="border-t border-slate-100 pt-3 px-3 mt-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Nível: {getRoleLabel(user?.role)}
          </div>
        </div>

        {/* Right Form/Content Card */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          
          {/* Alerts Box */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-3 bg-red-900/10 border border-red-200 rounded-lg text-red-700 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 p-3 bg-emerald-900/10 border border-emerald-200 rounded-lg text-emerald-700 text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: CHANGE PASSWORD */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800">Alterar Minha Senha</h2>
                <p className="text-xs text-slate-400 mt-0.5">Mantenha sua conta segura alterando sua senha periodicamente.</p>
              </div>

              <form onSubmit={handlePwdChangeSubmit} className="max-w-md space-y-4">
                <div className="relative">
                  <label className="form-label">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPwd.old ? 'text' : 'password'}
                      value={pwdForm.old_password}
                      onChange={(e) => setPwdForm(prev => ({ ...prev, old_password: e.target.value }))}
                      className="form-input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(prev => ({ ...prev, old: !prev.old }))}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPwd.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="form-label">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPwd.new ? 'text' : 'password'}
                      value={pwdForm.new_password}
                      onChange={(e) => setPwdForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="form-input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPwd.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="form-label">Confirmar Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPwd.confirm ? 'text' : 'password'}
                      value={pwdForm.confirm_password}
                      onChange={(e) => setPwdForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="form-input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPwd.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {loading ? 'Salvando...' : 'Alterar Senha'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER USER (Admin only) */}
          {activeTab === 'register' && isAdmin && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800">Cadastrar Novo Usuário</h2>
                <p className="text-xs text-slate-400 mt-0.5">Adicione novos colaboradores com permissões adequadas ao sistema.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="max-w-md space-y-4">
                <div>
                  <label className="form-label">Nome de Usuário (Username)</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                    placeholder="Ex: emersonmelo, juliasilva"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="exemplo@liramelo.com.br"
                    className="form-input"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="form-label">Senha Inicial</label>
                  <div className="relative">
                    <input
                      type={showRegisterPwd ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      className="form-input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPwd(!showRegisterPwd)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegisterPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Nível de Acesso (Perfil)</label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, role: e.target.value }))}
                    className="form-input cursor-pointer"
                  >
                    <option value="consulta">Leitura/Consulta (Apenas visualização)</option>
                    <option value="gestor">Gestor de Área (Leitura + Lançamento de extras)</option>
                    <option value="socio">Sócio-Diretor (Leitura + Aprovações e Relatórios)</option>
                    <option value="rh">Recursos Humanos (Operação total, sem Auditoria)</option>
                    <option value="admin">Administrador (Controle completo do sistema)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MANAGE USERS (Admin only) */}
          {activeTab === 'users' && isAdmin && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Contas e Acessos Cadastrados</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Veja a listagem de credenciais ativas e modifique seus status.</p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Atualizar Lista
                </button>
              </div>

              {fetchingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
                </div>
              ) : usersList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Nenhum usuário carregado.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="px-4 py-3">Usuário</th>
                        <th className="px-4 py-3">E-mail</th>
                        <th className="px-4 py-3">Perfil de Acesso</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((u) => {
                        const isSelf = u.username === user.username
                        return (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                              {u.username}
                              {isSelf && (
                                <span className="inline-block px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                                  Você
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{u.email}</td>
                            <td className="px-4 py-3 font-semibold text-slate-700">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-100' :
                                u.role === 'rh' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                u.role === 'socio' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                u.role === 'gestor' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                'bg-slate-50 text-slate-700 border border-slate-100'
                              }`}>
                                {getRoleLabel(u.role)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                                u.is_active 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {u.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {!isSelf ? (
                                <button
                                  onClick={() => handleToggleActive(u)}
                                  className={`p-1.5 rounded transition-all cursor-pointer ${
                                    u.is_active
                                      ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                      : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                  title={u.is_active ? 'Desativar Conta' : 'Ativar Conta'}
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-slate-300 font-semibold text-[10px]">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default UserSettings
