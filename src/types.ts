export type AssessmentType = 'Avaliação' | 'Simulado' | 'Trabalho' | 'Atividade';

export interface Assessment {
  id: string;
  date: string; // YYYY-MM-DD
  teacher_name: string;
  teacher_id?: string;
  subject: string;
  class_name: string;
  type: AssessmentType;
  notes?: string;
  created_date?: string;
  updated_date?: string;
  created_by_id?: string;
}

export interface Teacher {
  id: string;
  name: string;
  created_date?: string;
  updated_date?: string;
  created_by_id?: string;
}

export interface Subject {
  id: string;
  name: string;
  created_date?: string;
  updated_date?: string;
  created_by_id?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: 'Ensino Fundamental' | 'Ensino Médio';
  created_date?: string;
  updated_date?: string;
  created_by_id?: string;
}

export interface SchedulingSettings {
  id: string;
  medio_start_date: string;
  medio_end_date: string;
  fundamental_start_date: string;
  fundamental_end_date: string;
  blocked_dates: string[];
  notice_message?: string;
  created_date?: string;
  updated_date?: string;
  created_by_id?: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  password?: string;
  created_date?: string;
  updated_date?: string;
}

