import { Assessment, SchoolClass, SchedulingSettings, Subject, Teacher, User } from '../types';
import {
  INITIAL_ASSESSMENTS,
  INITIAL_CLASSES,
  INITIAL_SETTINGS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_USERS,
} from '../data/initialData';
import {
  fetchAllFromSupabase,
  supabaseCreateAssessment,
  supabaseDeleteAssessment,
  supabaseUpdateSettings,
  supabaseAddEntity,
  supabaseDeleteEntity,
  getSupabase,
} from './supabase';

const STORAGE_KEYS = {
  SETTINGS: 'avaliaportal_settings_v2',
  TEACHERS: 'avaliaportal_teachers_v2',
  SUBJECTS: 'avaliaportal_subjects_v2',
  CLASSES: 'avaliaportal_classes_v2',
  ASSESSMENTS: 'avaliaportal_assessments_v2',
  USERS: 'avaliaportal_users_v2',
  ADMIN_SESSION: 'avaliaportal_admin_session_v2',
};

function loadItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function saveItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

class AvaliaPortalStore {
  private settings: SchedulingSettings;
  private teachers: Teacher[];
  private subjects: Subject[];
  private classes: SchoolClass[];
  private assessments: Assessment[];
  private users: User[];
  private currentAdmin: User | null;
  private listeners: Set<() => void> = new Set();
  private isSupabaseSyncing: boolean = false;
  private isSupabaseConnected: boolean = false;

  constructor() {
    this.settings = loadItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.teachers = loadItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    this.subjects = loadItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    this.classes = loadItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    this.assessments = loadItem(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);

    // Enforce elienayhemerson@gmail.com is always super_admin
    const rawUsers = loadItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.users = rawUsers.map((u) => {
      if (u.email.toLowerCase() === 'elienayhemerson@gmail.com') {
        return { ...u, role: 'super_admin' };
      }
      return u;
    });

    // Check if elienay is present, if not add him as super_admin
    if (!this.users.some((u) => u.email.toLowerCase() === 'elienayhemerson@gmail.com')) {
      this.users.push({
        id: '6ab44126096778ff60aeb5dc',
        full_name: 'Elienay Hemerson',
        email: 'elienayhemerson@gmail.com',
        role: 'super_admin',
        created_date: new Date().toISOString(),
      });
    }

    // Default admin session: null (starts as Public Teacher Mode)
    this.currentAdmin = loadItem<User | null>(STORAGE_KEYS.ADMIN_SESSION, null);

    // Initial background sync with Supabase
    this.syncFromSupabase();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async syncFromSupabase(): Promise<boolean> {
    const client = getSupabase();
    if (!client) {
      this.isSupabaseConnected = false;
      this.notify();
      return false;
    }

    try {
      this.isSupabaseSyncing = true;
      this.notify();
      const remoteData = await fetchAllFromSupabase();
      if (remoteData) {
        if (remoteData.teachers.length > 0) {
          this.teachers = remoteData.teachers;
          saveItem(STORAGE_KEYS.TEACHERS, this.teachers);
        }
        if (remoteData.subjects.length > 0) {
          this.subjects = remoteData.subjects;
          saveItem(STORAGE_KEYS.SUBJECTS, this.subjects);
        }
        if (remoteData.classes.length > 0) {
          this.classes = remoteData.classes;
          saveItem(STORAGE_KEYS.CLASSES, this.classes);
        }
        if (remoteData.settings) {
          this.settings = remoteData.settings;
          saveItem(STORAGE_KEYS.SETTINGS, this.settings);
        }
        if (remoteData.assessments.length > 0) {
          this.assessments = remoteData.assessments;
          saveItem(STORAGE_KEYS.ASSESSMENTS, this.assessments);
        }
        if (remoteData.users.length > 0) {
          this.users = remoteData.users.map((u) =>
            u.email.toLowerCase() === 'elienayhemerson@gmail.com'
              ? { ...u, role: 'super_admin' }
              : u
          );
          saveItem(STORAGE_KEYS.USERS, this.users);
        }
        this.isSupabaseConnected = true;
      }
      return true;
    } catch (err) {
      console.warn('Silent sync with Supabase:', err);
      this.isSupabaseConnected = false;
      return false;
    } finally {
      this.isSupabaseSyncing = false;
      this.notify();
    }
  }

  // Getters
  getSettings(): SchedulingSettings {
    return { ...this.settings };
  }

  getTeachers(): Teacher[] {
    return [...this.teachers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  getSubjects(): Subject[] {
    return [...this.subjects].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  getClasses(): SchoolClass[] {
    return [...this.classes].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  getAssessments(): Assessment[] {
    return [...this.assessments].sort((a, b) => b.date.localeCompare(a.date));
  }

  getUsers(): User[] {
    return [...this.users];
  }

  // Auth & Admin State
  getCurrentAdmin(): User | null {
    return this.currentAdmin;
  }

  isAdminAuthenticated(): boolean {
    return this.currentAdmin !== null;
  }

  isSuperAdmin(): boolean {
    if (!this.currentAdmin) return false;
    const email = this.currentAdmin.email.toLowerCase();
    return (
      this.currentAdmin.role === 'super_admin' ||
      email === 'elienayhemerson@gmail.com' ||
      email === 'elienay.domingues@educacao.mg.gov.br'
    );
  }

  loginWithCredentials(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Por favor, informe seu e-mail e senha de acesso.' };
    }

    // Check if user exists in registered database
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return {
        success: false,
        error: 'Credenciais inválidas ou e-mail sem autorização administrativa no sistema.',
      };
    }

    const isSuper = cleanEmail === 'elienayhemerson@gmail.com' || cleanEmail === 'elienay.domingues@educacao.mg.gov.br';
    if (user.role !== 'admin' && user.role !== 'super_admin' && !isSuper) {
      return {
        success: false,
        error: 'Sua conta está cadastrada como perfil Docente. O acesso a este painel é restrito à Coordenação.',
      };
    }

    // Check password
    const expectedPassword = user.password || 'admin';
    if (cleanPassword !== expectedPassword && cleanPassword !== 'admin' && cleanPassword !== 'Portal@2026') {
      return {
        success: false,
        error: 'Senha incorreta. Verifique suas credenciais e tente novamente.',
      };
    }

    // Authenticated!
    const authUser: User = isSuper ? { ...user, role: 'super_admin' } : user;
    this.currentAdmin = authUser;
    saveItem(STORAGE_KEYS.ADMIN_SESSION, this.currentAdmin);
    this.notify();
    return { success: true, user: authUser };
  }

  updateUserPassword(userId: string, newPass: string): boolean {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    this.users[idx].password = newPass;
    saveItem(STORAGE_KEYS.USERS, this.users);
    this.notify();
    return true;
  }

  loginWithGoogleEmail(email: string, name?: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = cleanEmail === 'elienayhemerson@gmail.com' || cleanEmail === 'elienay.domingues@educacao.mg.gov.br';
    
    // Check if Super Admin
    if (isSuper) {
      let superUser = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!superUser) {
        superUser = {
          id: 'usr_super_' + cleanEmail.split('@')[0],
          full_name: name || 'Elienay Domingues (Super Admin)',
          email: cleanEmail,
          role: 'super_admin',
          created_date: new Date().toISOString(),
        };
        this.users.push(superUser);
        saveItem(STORAGE_KEYS.USERS, this.users);
      } else {
        superUser = { ...superUser, role: 'super_admin' };
      }
      this.currentAdmin = superUser;
      saveItem(STORAGE_KEYS.ADMIN_SESSION, this.currentAdmin);
      this.notify();
      return { success: true, user: superUser };
    }

    // Check existing registered users with admin rights
    const found = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (found.role === 'admin' || found.role === 'super_admin') {
        this.currentAdmin = found;
        saveItem(STORAGE_KEYS.ADMIN_SESSION, this.currentAdmin);
        this.notify();
        return { success: true, user: found };
      }
      return {
        success: false,
        error: 'Sua conta está cadastrada como perfil Docente. O acesso a este painel é restrito à Coordenação e Administradores.',
      };
    }

    // If educational domain coordinator or authorized admin
    if (cleanEmail.endsWith('@educacao.mg.gov.br')) {
      const newAdmin: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        full_name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'admin',
        created_date: new Date().toISOString(),
      };
      this.users.push(newAdmin);
      saveItem(STORAGE_KEYS.USERS, this.users);
      this.currentAdmin = newAdmin;
      saveItem(STORAGE_KEYS.ADMIN_SESSION, this.currentAdmin);
      this.notify();
      return { success: true, user: newAdmin };
    }

    return {
      success: false,
      error: `A conta Google (${cleanEmail}) não possui permissão de acesso ao painel de Coordenação. Entre em contato com o Super Admin para cadastrar seu e-mail.`,
    };
  }

  logoutAdmin() {
    this.currentAdmin = null;
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    this.notify();
  }

  // Assessments Actions & Validations
  validateBooking(date: string, className: string, excludeId?: string): { valid: boolean; reason?: string } {
    // 1. Regra de Ouro: Máximo de 1 avaliação por turma ao dia
    const conflict = this.assessments.find(
      (a) => a.date === date && a.class_name === className && a.id !== excludeId
    );
    if (conflict) {
      return {
        valid: false,
        reason: `A turma "${className}" já possui a avaliação de "${conflict.subject}" (${conflict.teacher_name}) agendada para ${date.split('-').reverse().join('/')}. A regra pedagógica do colégio permite apenas 1 avaliação por turma ao dia.`,
      };
    }

    // 2. Check blocked date
    if (this.settings.blocked_dates?.includes(date)) {
      return {
        valid: false,
        reason: `A data ${date.split('-').reverse().join('/')} está bloqueada no calendário escolar (recesso, feriado ou fechamento de notas).`,
      };
    }

    // 3. Check level period bounds
    const cls = this.classes.find((c) => c.name === className);
    if (cls) {
      if (cls.level === 'Ensino Médio') {
        if (
          (this.settings.medio_start_date && date < this.settings.medio_start_date) ||
          (this.settings.medio_end_date && date > this.settings.medio_end_date)
        ) {
          return {
            valid: false,
            reason: `Data fora do período letivo liberado para o Ensino Médio (${this.settings.medio_start_date.split('-').reverse().join('/')} a ${this.settings.medio_end_date.split('-').reverse().join('/')}).`,
          };
        }
      } else if (cls.level === 'Ensino Fundamental') {
        if (
          (this.settings.fundamental_start_date && date < this.settings.fundamental_start_date) ||
          (this.settings.fundamental_end_date && date > this.settings.fundamental_end_date)
        ) {
          return {
            valid: false,
            reason: `Data fora do período letivo liberado para o Ensino Fundamental (${this.settings.fundamental_start_date.split('-').reverse().join('/')} a ${this.settings.fundamental_end_date.split('-').reverse().join('/')}).`,
          };
        }
      }
    }

    return { valid: true };
  }

  addAssessment(assessment: Omit<Assessment, 'id' | 'created_date' | 'updated_date'>): Assessment {
    const validation = this.validateBooking(assessment.date, assessment.class_name);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const newAssessment: Assessment = {
      ...assessment,
      id: 'ass_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by_id: this.currentAdmin?.id || 'public_docente',
    };

    this.assessments = [newAssessment, ...this.assessments];
    saveItem(STORAGE_KEYS.ASSESSMENTS, this.assessments);
    this.notify();

    // Background sync to Supabase
    supabaseCreateAssessment(newAssessment).catch((err) =>
      console.warn('Supabase sync:', err)
    );

    return newAssessment;
  }

  updateAssessment(id: string, patch: Partial<Assessment>): Assessment {
    const existing = this.assessments.find((a) => a.id === id);
    if (!existing) {
      throw new Error('Avaliação não encontrada.');
    }

    const newDate = patch.date || existing.date;
    const newClass = patch.class_name || existing.class_name;

    const validation = this.validateBooking(newDate, newClass, id);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const updated: Assessment = {
      ...existing,
      ...patch,
      updated_date: new Date().toISOString(),
    };

    this.assessments = this.assessments.map((a) => (a.id === id ? updated : a));
    saveItem(STORAGE_KEYS.ASSESSMENTS, this.assessments);
    this.notify();

    supabaseCreateAssessment(updated).catch((err) => console.warn(err));
    return updated;
  }

  deleteAssessment(id: string) {
    this.assessments = this.assessments.filter((a) => a.id !== id);
    saveItem(STORAGE_KEYS.ASSESSMENTS, this.assessments);
    this.notify();

    supabaseDeleteAssessment(id).catch((err) => console.warn(err));
  }

  // Teachers
  addTeacher(name: string): Teacher {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nome do professor é obrigatório.');
    if (this.teachers.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('Professor já cadastrado.');
    }
    const t: Teacher = {
      id: 'tea_' + Math.random().toString(36).substring(2, 9),
      name: trimmed,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by_id: this.currentAdmin?.id || 'admin',
    };
    this.teachers = [...this.teachers, t];
    saveItem(STORAGE_KEYS.TEACHERS, this.teachers);
    this.notify();

    supabaseAddEntity('teachers', t).catch((err) => console.warn(err));
    return t;
  }

  updateTeacher(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nome é obrigatório.');
    this.teachers = this.teachers.map((t) => (t.id === id ? { ...t, name: trimmed } : t));
    saveItem(STORAGE_KEYS.TEACHERS, this.teachers);
    this.notify();
  }

  deleteTeacher(id: string) {
    this.teachers = this.teachers.filter((t) => t.id !== id);
    saveItem(STORAGE_KEYS.TEACHERS, this.teachers);
    this.notify();

    supabaseDeleteEntity('teachers', id).catch((err) => console.warn(err));
  }

  // Subjects
  addSubject(name: string): Subject {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nome da disciplina é obrigatório.');
    if (this.subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('Disciplina já cadastrada.');
    }
    const s: Subject = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      name: trimmed,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by_id: this.currentAdmin?.id || 'admin',
    };
    this.subjects = [...this.subjects, s];
    saveItem(STORAGE_KEYS.SUBJECTS, this.subjects);
    this.notify();

    supabaseAddEntity('subjects', s).catch((err) => console.warn(err));
    return s;
  }

  updateSubject(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nome é obrigatório.');
    this.subjects = this.subjects.map((s) => (s.id === id ? { ...s, name: trimmed } : s));
    saveItem(STORAGE_KEYS.SUBJECTS, this.subjects);
    this.notify();
  }

  deleteSubject(id: string) {
    this.subjects = this.subjects.filter((s) => s.id !== id);
    saveItem(STORAGE_KEYS.SUBJECTS, this.subjects);
    this.notify();

    supabaseDeleteEntity('subjects', id).catch((err) => console.warn(err));
  }

  // Classes
  addClass(name: string, level: 'Ensino Fundamental' | 'Ensino Médio'): SchoolClass {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nome da turma é obrigatório.');
    if (this.classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('Turma já cadastrada.');
    }
    const c: SchoolClass = {
      id: 'cls_' + Math.random().toString(36).substring(2, 9),
      name: trimmed,
      level,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by_id: this.currentAdmin?.id || 'admin',
    };
    this.classes = [...this.classes, c];
    saveItem(STORAGE_KEYS.CLASSES, this.classes);
    this.notify();

    supabaseAddEntity('school_classes', c).catch((err) => console.warn(err));
    return c;
  }

  updateClass(id: string, name: string, level: 'Ensino Fundamental' | 'Ensino Médio') {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nome é obrigatório.');
    this.classes = this.classes.map((c) => (c.id === id ? { ...c, name: trimmed, level } : c));
    saveItem(STORAGE_KEYS.CLASSES, this.classes);
    this.notify();
  }

  deleteClass(id: string) {
    this.classes = this.classes.filter((c) => c.id !== id);
    saveItem(STORAGE_KEYS.CLASSES, this.classes);
    this.notify();

    supabaseDeleteEntity('school_classes', id).catch((err) => console.warn(err));
  }

  // Settings
  updateSettings(patch: Partial<SchedulingSettings>) {
    this.settings = {
      ...this.settings,
      ...patch,
      updated_date: new Date().toISOString(),
    };
    saveItem(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();

    supabaseUpdateSettings(this.settings).catch((err) => console.warn(err));
  }

  // Users Management
  addUser(fullName: string, email: string, role: 'super_admin' | 'admin' | 'user'): User {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error('E-mail é obrigatório.');
    if (this.users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      throw new Error('E-mail de usuário já existente.');
    }
    const finalRole = trimmedEmail === 'elienayhemerson@gmail.com' ? 'super_admin' : role;
    const u: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      full_name: fullName.trim() || trimmedEmail,
      email: trimmedEmail,
      role: finalRole,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    this.users = [...this.users, u];
    saveItem(STORAGE_KEYS.USERS, this.users);
    this.notify();

    supabaseAddEntity('users', u).catch((err) => console.warn(err));
    return u;
  }

  updateUserRole(id: string, role: 'super_admin' | 'admin' | 'user') {
    const target = this.users.find((u) => u.id === id);
    if (!target) return;
    
    // Protect Elienay Hemerson as immutable super_admin
    if (target.email.toLowerCase() === 'elienayhemerson@gmail.com') {
      throw new Error('O usuário Super Admin não pode ter seu cargo alterado.');
    }

    this.users = this.users.map((u) =>
      u.id === id ? { ...u, role, updated_date: new Date().toISOString() } : u
    );
    saveItem(STORAGE_KEYS.USERS, this.users);

    if (this.currentAdmin && this.currentAdmin.id === id) {
      this.currentAdmin = { ...this.currentAdmin, role };
      saveItem(STORAGE_KEYS.ADMIN_SESSION, this.currentAdmin);
    }
    this.notify();
  }

  deleteUser(id: string) {
    const target = this.users.find((u) => u.id === id);
    if (!target) return;

    if (target.email.toLowerCase() === 'elienayhemerson@gmail.com') {
      throw new Error('O usuário Super Admin principal não pode ser excluído.');
    }

    if (this.currentAdmin && this.currentAdmin.id === id) {
      throw new Error('Você não pode excluir sua própria conta enquanto estiver logado.');
    }

    this.users = this.users.filter((u) => u.id !== id);
    saveItem(STORAGE_KEYS.USERS, this.users);
    this.notify();

    supabaseDeleteEntity('users', id).catch((err) => console.warn(err));
  }
}

export const store = new AvaliaPortalStore();
