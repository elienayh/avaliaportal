import React, { useState } from 'react';
import {
  Assessment,
  SchoolClass,
  SchedulingSettings,
  Subject,
  Teacher,
  User,
} from '../types';
import { formatBR } from '../lib/calendar';
import { exportAssessmentsPdf } from '../lib/exportPdf';
import { store } from '../services/store';
import {
  BookOpen,
  CalendarCheck,
  CalendarRange,
  Check,
  Download,
  FileDown,
  Filter,
  GraduationCap,
  Layers,
  Lock,
  Pencil,
  Plus,
  School,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';

interface AdminDashboardProps {
  assessments: Assessment[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: SchoolClass[];
  settings: SchedulingSettings;
  users: User[];
  onOpenBooking: (date?: string, assessment?: Assessment) => void;
  onSuccess: (msg: string) => void;
}

type TabType = 'assessments' | 'teachers' | 'subjects' | 'classes' | 'period' | 'users';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  assessments,
  teachers,
  subjects,
  classes,
  settings,
  users,
  onOpenBooking,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('assessments');

  // Assessments tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Catalog CRUD states
  const [newTeacherName, setNewTeacherName] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');

  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');

  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState<'Ensino Fundamental' | 'Ensino Médio'>('Ensino Médio');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassLevel, setEditClassLevel] = useState<'Ensino Fundamental' | 'Ensino Médio'>('Ensino Médio');

  // Period / Settings state
  const [medioStart, setMedioStart] = useState(settings.medio_start_date || '');
  const [medioEnd, setMedioEnd] = useState(settings.medio_end_date || '');
  const [fundStart, setFundStart] = useState(settings.fundamental_start_date || '');
  const [fundEnd, setFundEnd] = useState(settings.fundamental_end_date || '');
  const [newBlockDate, setNewBlockDate] = useState('');
  const [noticeMessage, setNoticeMessage] = useState(settings.notice_message || '');

  // Users state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('admin');

  const currentAdmin = store.getCurrentAdmin();
  const isSuperAdmin = store.isSuperAdmin();

  // Filtering assessments
  const filteredAssessments = assessments.filter((a) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        a.subject.toLowerCase().includes(q) ||
        a.teacher_name.toLowerCase().includes(q) ||
        a.class_name.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterTeacher && a.teacher_name !== filterTeacher) return false;
    if (filterSubject && a.subject !== filterSubject) return false;
    if (filterClass && a.class_name !== filterClass) return false;
    if (filterType && a.type !== filterType) return false;
    if (filterFrom && a.date < filterFrom) return false;
    if (filterTo && a.date > filterTo) return false;
    return true;
  });

  // KPI Calculations
  const totalAssessments = assessments.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalSimulados = assessments.filter((a) => a.type === 'Simulado').length;
  const totalAvaliacoes = assessments.filter((a) => a.type === 'Avaliação').length;

  // Actions
  const handleDeleteAssessment = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento de "${name}"?`)) {
      store.deleteAssessment(id);
      onSuccess('Agendamento excluído com sucesso!');
    }
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;
    try {
      store.addTeacher(newTeacherName);
      setNewTeacherName('');
      onSuccess('Professor(a) cadastrado(a) com sucesso!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  };

  const handleSaveTeacherEdit = (id: string) => {
    if (!editTeacherName.trim()) return;
    store.updateTeacher(id, editTeacherName);
    setEditingTeacherId(null);
    onSuccess('Professor atualizado!');
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (window.confirm(`Excluir professor "${name}"?`)) {
      store.deleteTeacher(id);
      onSuccess('Professor excluído!');
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      store.addSubject(newSubjectName);
      setNewSubjectName('');
      onSuccess('Disciplina cadastrada!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  };

  const handleSaveSubjectEdit = (id: string) => {
    if (!editSubjectName.trim()) return;
    store.updateSubject(id, editSubjectName);
    setEditingSubjectId(null);
    onSuccess('Disciplina atualizada!');
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (window.confirm(`Excluir disciplina "${name}"?`)) {
      store.deleteSubject(id);
      onSuccess('Disciplina excluída!');
    }
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      store.addClass(newClassName, newClassLevel);
      setNewClassName('');
      onSuccess('Turma cadastrada com sucesso!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  };

  const handleSaveClassEdit = (id: string) => {
    if (!editClassName.trim()) return;
    store.updateClass(id, editClassName, editClassLevel);
    setEditingClassId(null);
    onSuccess('Turma atualizada!');
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (window.confirm(`Excluir turma "${name}"?`)) {
      store.deleteClass(id);
      onSuccess('Turma excluída!');
    }
  };

  const handleSaveSettings = () => {
    store.updateSettings({
      medio_start_date: medioStart,
      medio_end_date: medioEnd,
      fundamental_start_date: fundStart,
      fundamental_end_date: fundEnd,
      notice_message: noticeMessage,
    });
    onSuccess('Configurações salvas com sucesso!');
  };

  const handleAddBlockDate = () => {
    if (!newBlockDate) return;
    if (settings.blocked_dates.includes(newBlockDate)) {
      alert('Esta data já está bloqueada.');
      return;
    }
    const updated = [...settings.blocked_dates, newBlockDate].sort();
    store.updateSettings({ blocked_dates: updated });
    setNewBlockDate('');
    onSuccess('Data de bloqueio adicionada com sucesso!');
  };

  const handleRemoveBlockDate = (dateToRemove: string) => {
    const updated = settings.blocked_dates.filter((d) => d !== dateToRemove);
    store.updateSettings({ blocked_dates: updated });
    onSuccess('Data desbloqueada no calendário!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    try {
      store.addUser(newUserName, newUserEmail, newUserRole);
      setNewUserName('');
      setNewUserEmail('');
      onSuccess('Usuário adicionado com sucesso!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar usuário');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Admin Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-5 sm:p-6 rounded-3xl border border-white/10 shadow-lg backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Gestão da Coordenação Pedagógica
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Painel Administrativo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Controle completo sobre o calendário avaliativo, catálogos escolares, relatórios em PDF e controle de acessos da equipe.
          </p>
        </div>

        {currentAdmin && (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-sm shadow-inner">
              {currentAdmin.full_name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[160px]">
                  {currentAdmin.full_name}
                </span>
                {isSuperAdmin ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider shadow-xs">
                    Super Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-sky-500/30 text-sky-200">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-300 block truncate max-w-[190px]">
                {currentAdmin.email}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalAssessments}</div>
            <div className="text-xs text-slate-500">Agendamentos</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
            <div className="text-xs text-slate-500">Turmas Ativas</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalTeachers}</div>
            <div className="text-xs text-slate-500">Professores</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {totalSimulados} <span className="text-xs font-normal text-slate-400">/ {totalAvaliacoes}</span>
            </div>
            <div className="text-xs text-slate-500">Simulados / Provas</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'assessments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Gestão de Avaliações</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'teachers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Professores ({teachers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'subjects'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Disciplinas ({subjects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'classes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Turmas ({classes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('period')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'period'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>Período & Bloqueios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Usuários & Acessos ({users.length})</span>
        </button>
      </div>

      {/* Tab: Assessments Management */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          {/* Action Bar & PDF Exporters */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por disciplina, professor, turma ou observação..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Baixar Código Fonte Atualizado para Git */}
              <a
                href="/avaliaportal-atualizado.zip"
                download="avaliaportal-atualizado.zip"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition shadow-2xs"
                title="Baixar pacote .zip completo com as alterações para versionar no Git"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Baixar Versão Atual (.zip)</span>
              </a>

              {/* PDF Exporters - A4 Horizontal Monthly Calendar */}
              <button
                type="button"
                onClick={() => {
                  const filterTitle = filterClass ? `Turma: ${filterClass}` : filterSubject ? `Disciplina: ${filterSubject}` : 'Todas as Turmas';
                  exportAssessmentsPdf(filteredAssessments, classes, {
                    filterTitle: `Calendário Mensal · ${filterTitle}`,
                    mode: 'calendar'
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
                title="Gera PDF em formato A4 Horizontal como um calendário mensal completo com os horários"
              >
                <FileDown className="w-4 h-4 text-sky-200" />
                <span>Exportar Calendário Mensal (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  exportAssessmentsPdf(filteredAssessments, classes, {
                    filterTitle: 'Agrupado por Turma',
                    mode: 'class'
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                title="Exporta PDF no formato A4 Horizontal com foco em turmas"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span>Por Turma</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenBooking(new Date().toISOString().slice(0, 10))}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Marcação</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros:</span>
            </div>

            {/* Date from */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400">De:</span>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>

            {/* Date to */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Até:</span>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>

            {/* Teacher */}
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
            >
              <option value="">Todos os Professores</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Subject */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
            >
              <option value="">Todas as Disciplinas</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Class */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
            >
              <option value="">Todas as Turmas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(searchTerm || filterTeacher || filterSubject || filterClass || filterType || filterFrom || filterTo) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterTeacher('');
                  setFilterSubject('');
                  setFilterClass('');
                  setFilterType('');
                  setFilterFrom('');
                  setFilterTo('');
                }}
                className="text-xs text-sky-600 font-semibold hover:underline ml-auto"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* Table / List */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Mobile Card List (sm:hidden) */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {filteredAssessments.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Nenhuma avaliação encontrada com os filtros selecionados.
                </div>
              ) : (
                filteredAssessments.map((a) => (
                  <div key={a.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block">{a.subject}</span>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          {a.class_name} · {a.teacher_name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/70 shrink-0">
                        {formatBR(a.date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {a.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenBooking(a.date, a)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssessment(a.id, `${a.subject} - ${a.class_name}`)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {a.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50/80 p-2 rounded-xl">
                        {a.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider border-b border-slate-200/80 font-bold">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Disciplina</th>
                    <th className="px-4 py-3">Turma</th>
                    <th className="px-4 py-3">Professor</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Observações</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Nenhuma avaliação encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                          {formatBR(a.date)}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {a.subject}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{a.class_name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {a.teacher_name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {a.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                          {a.notes || '—'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenBooking(a.date, a)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition mr-1"
                            title="Editar agendamento"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssessment(a.id, `${a.subject} - ${a.class_name}`)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                            title="Excluir agendamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Teachers */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Cadastrar Novo(a) Professor(a)</h3>
            <form onSubmit={handleAddTeacher} className="flex gap-2">
              <input
                type="text"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                placeholder="Nome do(a) professor(a)..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
            {teachers.map((t) => (
              <div key={t.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                {editingTeacherId === t.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editTeacherName}
                      onChange={(e) => setEditTeacherName(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm flex-1 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveTeacherEdit(t.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Salvar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTeacherId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-slate-800 text-sm">{t.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeacherId(t.id);
                          setEditTeacherName(t.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition"
                        title="Editar nome"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeacher(t.id, t.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                        title="Excluir professor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Subjects */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Cadastrar Nova Disciplina</h3>
            <form onSubmit={handleAddSubject} className="flex gap-2">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Ex: Filosofia, Sociologia, Robótica..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
            {subjects.map((s) => (
              <div key={s.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                {editingSubjectId === s.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editSubjectName}
                      onChange={(e) => setEditSubjectName(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm flex-1 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSubjectEdit(s.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Salvar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSubjectId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-slate-800 text-sm">{s.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubjectId(s.id);
                          setEditSubjectName(s.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition"
                        title="Editar disciplina"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(s.id, s.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                        title="Excluir disciplina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Classes */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Cadastrar Nova Turma</h3>
            <form onSubmit={handleAddClass} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ex: 1ª Série B, 6º Ano 2..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
              <select
                value={newClassLevel}
                onChange={(e) => setNewClassLevel(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
              >
                <option value="Ensino Médio">Ensino Médio</option>
                <option value="Ensino Fundamental">Ensino Fundamental</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
            {classes.map((c) => (
              <div key={c.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                {editingClassId === c.id ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editClassName}
                      onChange={(e) => setEditClassName(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm flex-1 focus:outline-hidden"
                      autoFocus
                    />
                    <select
                      value={editClassLevel}
                      onChange={(e) => setEditClassLevel(e.target.value as any)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Ensino Médio">Ensino Médio</option>
                      <option value="Ensino Fundamental">Ensino Fundamental</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveClassEdit(c.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Salvar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingClassId(null)}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-800 text-sm">{c.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.level === 'Ensino Médio'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {c.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingClassId(c.id);
                          setEditClassName(c.name);
                          setEditClassLevel(c.level);
                        }}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition"
                        title="Editar turma"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(c.id, c.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                        title="Excluir turma"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Period & Blocked Dates */}
      {activeTab === 'period' && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Janela de Avaliações por Nível de Ensino</h3>
            <p className="text-xs text-slate-500">
              Defina os intervalos letivos em que agendamentos de avaliações e simulados são permitidos para cada etapa escolar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Ensino Médio */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                  Ensino Médio
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={medioStart}
                      onChange={(e) => setMedioStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={medioEnd}
                      onChange={(e) => setMedioEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Ensino Fundamental */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                  Ensino Fundamental
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={fundStart}
                      onChange={(e) => setFundStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={fundEnd}
                      onChange={(e) => setFundEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Salvar Períodos Letivos
              </button>
            </div>
          </div>

          {/* Mensagem da Página Inicial */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Mensagem Institucional da Página Inicial</h3>
            <p className="text-xs text-slate-500">
              Esta mensagem é exibida logo abaixo do título "Calendário Acadêmico de Avaliações" para os professores e comunidade escolar.
            </p>
            <textarea
              value={noticeMessage}
              onChange={(e) => setNoticeMessage(e.target.value)}
              rows={3}
              placeholder="Digite aqui o aviso ou orientação pedagógica..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Atualizar Mensagem na Página Inicial
              </button>
              {noticeMessage && (
                <button
                  type="button"
                  onClick={() => {
                    setNoticeMessage('');
                    store.updateSettings({ notice_message: '' });
                    onSuccess('Mensagem da página inicial removida.');
                  }}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium transition"
                >
                  Remover Mensagem
                </button>
              )}
            </div>
          </div>

          {/* Blocked Dates */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Feriados e Datas Bloqueadas no Calendário</h3>
            <p className="text-xs text-slate-500">
              Datas em que nenhuma avaliação pode ser agendada (recessos escolares, feriados nacionais/municipais ou conselhos de classe).
            </p>

            <div className="flex gap-2 max-w-sm">
              <input
                type="date"
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs flex-1 bg-white"
              />
              <button
                type="button"
                onClick={handleAddBlockDate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shrink-0 transition"
              >
                Bloquear Data
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {settings.blocked_dates.length === 0 ? (
                <span className="text-xs text-slate-400">Nenhuma data bloqueada configurada.</span>
              ) : (
                settings.blocked_dates.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/70"
                  >
                    <span>{formatBR(d)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockDate(d)}
                      className="p-0.5 hover:text-rose-950 text-rose-500"
                      title="Desbloquear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Add user form */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Cadastrar Novo Acesso Administrativo</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nome completo..."
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@educacao.mg.gov.br..."
                required
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
              >
                <option value="admin">Administrador (Coordenação)</option>
                <option value="user">Docente / Usuário</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Conceder Acesso</span>
              </button>
            </form>
          </div>

          {/* Users List with Super Admin Protection */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
            {users.map((u) => {
              const isUserSuperAdmin =
                u.role === 'super_admin' || u.email.toLowerCase() === 'elienayhemerson@gmail.com';

              return (
                <div
                  key={u.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    isUserSuperAdmin ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isUserSuperAdmin
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-xs'
                          : u.role === 'admin'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.full_name?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{u.full_name}</span>
                        {isUserSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Lock className="w-3 h-3 text-amber-700" /> Super Admin
                          </span>
                        ) : u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            Administrador
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Docente
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUserSuperAdmin ? (
                      <span className="text-[11px] font-medium text-amber-800 bg-amber-100/70 px-3 py-1 rounded-xl">
                        Acesso Master Permanente
                      </span>
                    ) : (
                      <>
                        <select
                          value={u.role}
                          onChange={(e) => {
                            try {
                              store.updateUserRole(u.id, e.target.value as any);
                              onSuccess('Nível de acesso atualizado!');
                            } catch (err: unknown) {
                              alert(err instanceof Error ? err.message : 'Erro ao alterar');
                            }
                          }}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                        >
                          <option value="admin">Administrador</option>
                          <option value="user">Docente</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remover acesso de ${u.email}?`)) {
                              try {
                                store.deleteUser(u.id);
                                onSuccess('Acesso de usuário removido!');
                              } catch (err: unknown) {
                                alert(err instanceof Error ? err.message : 'Erro ao remover');
                              }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                          title="Remover acesso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
