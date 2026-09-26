import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Assessment, Teacher, Subject, SchoolClass, SchedulingSettings, User } from '../types';
import {
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_SETTINGS,
  INITIAL_ASSESSMENTS,
  INITIAL_USERS,
} from '../data/initialData';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://vidadeurpdtntngmqezn.supabase.co';

const STORAGE_KEY_ANON = 'avaliaportal_supabase_anon_key';

export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Yhm8Wj2gj2rxod5sgnd18Q_Pi0vkE1-';

export function getStoredAnonKey(): string {
  if (typeof window === 'undefined') return DEFAULT_SUPABASE_ANON_KEY;
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem(STORAGE_KEY_ANON) ||
    DEFAULT_SUPABASE_ANON_KEY
  );
}

export function saveAnonKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
    initSupabaseClient();
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const anonKey = getStoredAnonKey();
  if (!SUPABASE_URL || !anonKey) {
    supabaseInstance = null;
    return null;
  }

  try {
    supabaseInstance = createClient(SUPABASE_URL, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Falha ao inicializar o cliente Supabase:', err);
    supabaseInstance = null;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
}

export async function testConnection(): Promise<{ success: boolean; message: string; tableCount?: number }> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Chave de API pública (Anon Key) do Supabase não configurada.',
    };
  }

  try {
    const { data, error } = await client.from('teachers').select('id').limit(5);
    if (error) {
      return {
        success: false,
        message: `Erro do Supabase: ${error.message} (Código: ${error.code})`,
      };
    }
    return {
      success: true,
      message: 'Conectado com sucesso ao Supabase!',
      tableCount: data ? data.length : 0,
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Falha ao conectar com o Supabase.',
    };
  }
}

// ----------------- CARREGAMENTO REMOTO DO SUPABASE -----------------

export async function fetchAllFromSupabase(): Promise<{
  teachers: Teacher[];
  subjects: Subject[];
  classes: SchoolClass[];
  settings: SchedulingSettings;
  assessments: Assessment[];
  users: User[];
} | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const [
      { data: teachers, error: errT },
      { data: subjects, error: errS },
      { data: classes, error: errC },
      { data: settings, error: errSt },
      { data: assessments, error: errA },
      { data: users, error: errU },
    ] = await Promise.all([
      client.from('teachers').select('*').order('name'),
      client.from('subjects').select('*').order('name'),
      client.from('school_classes').select('*').order('name'),
      client.from('scheduling_settings').select('*').limit(1),
      client.from('assessments').select('*').order('date', { ascending: false }),
      client.from('users').select('*').order('created_date'),
    ]);

    if (errT || errS || errC) {
      console.warn('Erro ao consultar tabelas Supabase:', { errT, errS, errC });
      return null;
    }

    return {
      teachers: (teachers as Teacher[]) || [],
      subjects: (subjects as Subject[]) || [],
      classes: (classes as SchoolClass[]) || [],
      settings: (settings && settings[0]) ? (settings[0] as SchedulingSettings) : INITIAL_SETTINGS,
      assessments: (assessments as Assessment[]) || [],
      users: (users as User[]) || [],
    };
  } catch (e) {
    console.error('Exceção ao sincronizar com Supabase:', e);
    return null;
  }
}

// ----------------- OPERAÇÕES REMOTAS -----------------

export async function supabaseCreateAssessment(assessment: Assessment): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('assessments').insert([assessment]);
    if (error) {
      console.error('Erro ao inserir avaliação no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha de rede ao inserir no Supabase:', err);
    return false;
  }
}

export async function supabaseDeleteAssessment(id: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('assessments').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar avaliação no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao deletar no Supabase:', err);
    return false;
  }
}

export async function supabaseUpdateSettings(settings: SchedulingSettings): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('scheduling_settings').upsert([settings]);
    if (error) {
      console.error('Erro ao atualizar configurações no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao atualizar configurações no Supabase:', err);
    return false;
  }
}

export async function supabaseAddEntity<T extends { id: string }>(
  tableName: 'teachers' | 'subjects' | 'school_classes' | 'users',
  item: T
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from(tableName).insert([item]);
    if (error) {
      console.error(`Erro ao inserir em ${tableName}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Falha ao inserir em ${tableName}:`, err);
    return false;
  }
}

export async function supabaseDeleteEntity(
  tableName: 'teachers' | 'subjects' | 'school_classes' | 'users',
  id: string
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from(tableName).delete().eq('id', id);
    if (error) {
      console.error(`Erro ao deletar de ${tableName}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Falha ao deletar de ${tableName}:`, err);
    return false;
  }
}

export async function seedSupabaseInitialData(): Promise<{ success: boolean; message: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase não conectado. Informe a Anon Key primeiro.' };
  }

  try {
    // Insere configurações
    await client.from('scheduling_settings').upsert([INITIAL_SETTINGS]);

    // Insere professores
    if (INITIAL_TEACHERS.length > 0) {
      await client.from('teachers').upsert(INITIAL_TEACHERS);
    }

    // Insere disciplinas
    if (INITIAL_SUBJECTS.length > 0) {
      await client.from('subjects').upsert(INITIAL_SUBJECTS);
    }

    // Insere turmas
    if (INITIAL_CLASSES.length > 0) {
      await client.from('school_classes').upsert(INITIAL_CLASSES);
    }

    // Insere avaliações
    if (INITIAL_ASSESSMENTS.length > 0) {
      await client.from('assessments').upsert(INITIAL_ASSESSMENTS);
    }

    // Insere usuários
    if (INITIAL_USERS.length > 0) {
      await client.from('users').upsert(INITIAL_USERS);
    }

    return {
      success: true,
      message: 'Dados iniciais do Portal do Saber semeados com sucesso no Supabase!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erro ao sincronizar dados com o Supabase.',
    };
  }
}
