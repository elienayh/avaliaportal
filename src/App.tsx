import React, { useState, useEffect } from 'react';
import { Assessment, SchoolClass, SchedulingSettings, Subject, Teacher, User } from './types';
import { store } from './services/store';
import { getSupabase } from './services/supabase';
import { CalendarView } from './components/CalendarView';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import {
  Calendar,
  CheckCircle,
  Lock,
  LogOut,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';

export default function App() {
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(store.getCurrentAdmin());
  const [activeTab, setActiveTab] = useState<'calendar' | 'admin'>('calendar');

  // School entities state
  const [assessments, setAssessments] = useState<Assessment[]>(store.getAssessments());
  const [teachers, setTeachers] = useState<Teacher[]>(store.getTeachers());
  const [subjects, setSubjects] = useState<Subject[]>(store.getSubjects());
  const [classes, setClasses] = useState<SchoolClass[]>(store.getClasses());
  const [settings, setSettings] = useState<SchedulingSettings>(store.getSettings());
  const [users, setUsers] = useState<User[]>(store.getUsers());

  // Modal dialog states
  const [loginOpen, setLoginOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<string | undefined>(undefined);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setAssessments(store.getAssessments());
      setTeachers(store.getTeachers());
      setSubjects(store.getSubjects());
      setClasses(store.getClasses());
      setSettings(store.getSettings());
      setUsers(store.getUsers());
      setCurrentAdmin(store.getCurrentAdmin());
    });

    // Check for Supabase OAuth redirect session
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user?.email) {
          const res = store.loginWithGoogleEmail(
            data.session.user.email,
            data.session.user.user_metadata?.full_name
          );
          if (res.success && res.user) {
            showToast(`Bem-vindo(a), ${res.user.full_name}!`);
          }
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const res = store.loginWithGoogleEmail(
            session.user.email,
            session.user.user_metadata?.full_name
          );
          if (res.success && res.user) {
            setActiveTab('admin');
            showToast(`Autenticado com sucesso: ${res.user.full_name}`);
          }
        }
      });

      return () => {
        unsubscribe();
        authListener.subscription.unsubscribe();
      };
    }

    return unsubscribe;
  }, []);

  const handleOpenBooking = (date?: string, assessment?: Assessment) => {
    setBookingDate(date);
    setEditingAssessment(assessment || null);
    setBookingOpen(true);
  };

  const handleLogout = () => {
    store.logoutAdmin();
    setActiveTab('calendar');
    showToast('Sessão administrativa encerrada.');
  };

  const isAdmin = currentAdmin !== null;
  const isSuperAdmin = store.isSuperAdmin();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modern Frosted Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-white/10 text-white shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
            {/* School Brand Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-sky-500/20 shrink-0 border border-white/20">
                PS
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight truncate text-white">
                    COLÉGIO PORTAL DO SABER
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    SRE Carangola
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  AvaliaPortal · Calendário e Agendamento Pedagógico
                </p>
              </div>
            </div>

            {/* Right Controls: Navigation & Authentication */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isAdmin ? (
                /* Authenticated Admin Controls */
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Tab Selector between Calendar and Admin Dashboard */}
                  <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveTab('calendar')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        activeTab === 'calendar'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Calendário
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        activeTab === 'admin'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Coordenação
                    </button>
                  </div>

                  {/* Profile Indicator */}
                  <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        isSuperAdmin
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-sky-500 text-white'
                      }`}
                    >
                      {currentAdmin?.full_name?.slice(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                        {currentAdmin?.full_name}
                      </div>
                      <div className="text-[9px] text-slate-300 font-medium">
                        {isSuperAdmin ? 'Super Admin' : 'Admin'}
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-400/40 text-xs font-medium flex items-center gap-1.5 transition"
                    title="Encerrar Sessão"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              ) : (
                /* Public Teacher Mode - Admin Login CTA */
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-xs font-semibold border border-white/15 backdrop-blur-md transition shadow-xs group"
                >
                  {/* Google colored G icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Acesso da Coordenação</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
        {activeTab === 'calendar' ? (
          <CalendarView
            assessments={assessments}
            classes={classes}
            settings={settings}
            onBookDate={(d) => handleOpenBooking(d)}
            onEditAssessment={(a) => handleOpenBooking(a.date, a)}
            isAdmin={isAdmin}
          />
        ) : (
          <AdminDashboard
            assessments={assessments}
            teachers={teachers}
            subjects={subjects}
            classes={classes}
            settings={settings}
            users={users}
            onOpenBooking={handleOpenBooking}
            onSuccess={showToast}
          />
        )}
      </main>

      {/* Booking Dialog Modal (Public & Admin) */}
      <BookingModal
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setEditingAssessment(null);
        }}
        initialDate={bookingDate}
        editAssessment={editingAssessment}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        settings={settings}
        onSuccess={showToast}
      />

      {/* Admin Google Login Modal */}
      <AdminLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={(user) => {
          setActiveTab('admin');
          showToast(`Bem-vindo(a), ${user.full_name}! Acesso de Coordenação liberado.`);
        }}
      />

      {/* Clean Institutional Footer */}
      <footer className="bg-white/70 backdrop-blur-md border-t border-slate-200/80 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Colégio Portal do Saber · SRE Carangola · Superintendência Regional de Ensino
          </div>
          <div className="text-[11px] text-slate-400">
            Regra Pedagógica de Agendamento: 1 avaliação diária por turma
          </div>
        </div>
      </footer>
    </div>
  );
}
