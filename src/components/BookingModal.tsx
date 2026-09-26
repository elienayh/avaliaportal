import React, { useState, useEffect } from 'react';
import { Assessment, AssessmentType, SchoolClass, SchedulingSettings, Subject, Teacher } from '../types';
import { formatBR, isBlockedDay } from '../lib/calendar';
import { store } from '../services/store';
import { AlertCircle, Calendar, Check, X } from 'lucide-react';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  editAssessment?: Assessment | null;
  teachers: Teacher[];
  subjects: Subject[];
  classes: SchoolClass[];
  settings: SchedulingSettings;
  onSuccess: (msg: string) => void;
}

const TYPES: AssessmentType[] = ['Avaliação', 'Simulado', 'Trabalho', 'Atividade'];

export const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  initialDate,
  editAssessment,
  teachers,
  subjects,
  classes,
  settings,
  onSuccess
}) => {
  const [date, setDate] = useState(initialDate || '');
  const [teacherName, setTeacherName] = useState('');
  const [customTeacher, setCustomTeacher] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [customSubject, setCustomSubject] = useState(false);
  const [className, setClassName] = useState('');
  const [type, setType] = useState<AssessmentType>('Avaliação');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editAssessment) {
      setDate(editAssessment.date);
      setTeacherName(editAssessment.teacher_name);
      setCustomTeacher(!teachers.some((t) => t.name === editAssessment.teacher_name));
      setSubjectName(editAssessment.subject);
      setCustomSubject(!subjects.some((s) => s.name === editAssessment.subject));
      setClassName(editAssessment.class_name);
      setType(editAssessment.type);
      setNotes(editAssessment.notes || '');
    } else {
      setDate(initialDate || new Date().toISOString().slice(0, 10));
      setTeacherName(teachers[0]?.name || '');
      setCustomTeacher(false);
      setSubjectName(subjects[0]?.name || '');
      setCustomSubject(false);
      setClassName(classes[0]?.name || '');
      setType('Avaliação');
      setNotes('');
    }
    setError(null);
  }, [open, initialDate, editAssessment, teachers, subjects, classes]);

  if (!open) return null;

  // Real-time conflict preview
  const conflictCheck = date && className ? store.validateBooking(date, className, editAssessment?.id) : { valid: true };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Por favor, informe a data da avaliação.');
      return;
    }
    if (!teacherName.trim()) {
      setError('Por favor, selecione ou informe o professor.');
      return;
    }
    if (!subjectName.trim()) {
      setError('Por favor, selecione ou informe a disciplina.');
      return;
    }
    if (!className.trim()) {
      setError('Por favor, selecione a turma.');
      return;
    }

    try {
      const teacherObj = teachers.find((t) => t.name.toLowerCase() === teacherName.trim().toLowerCase());
      if (editAssessment) {
        store.updateAssessment(editAssessment.id, {
          date,
          teacher_name: teacherName.trim(),
          teacher_id: teacherObj?.id,
          subject: subjectName.trim(),
          class_name: className,
          type,
          notes: notes.trim()
        });
        onSuccess('Avaliação atualizada com sucesso!');
      } else {
        store.addAssessment({
          date,
          teacher_name: teacherName.trim(),
          teacher_id: teacherObj?.id,
          subject: subjectName.trim(),
          class_name: className,
          type,
          notes: notes.trim()
        });
        onSuccess('Avaliação agendada com sucesso!');
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao salvar o agendamento.');
      }
    }
  };

  const isBlocked = isBlockedDay(date, settings);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h2 className="font-semibold text-lg">
              {editAssessment ? 'Editar Agendamento' : 'Agendar Nova Avaliação'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!conflictCheck.valid && conflictCheck.reason && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-sm rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">Regra de conflito:</p>
                <p>{conflictCheck.reason}</p>
              </div>
            </div>
          )}

          {isBlocked && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              ⚠️ Esta data está marcada como bloqueada no calendário escolar (recesso ou feriado).
            </div>
          )}

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data da Avaliação <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
            {date && (
              <span className="text-xs text-slate-500 mt-1 block">
                Data formatada: {formatBR(date)}
              </span>
            )}
          </div>

          {/* Turma */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Turma <span className="text-red-500">*</span>
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="">Selecione uma turma...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          {/* Professor */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Professor(a) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCustomTeacher(!customTeacher);
                  if (customTeacher) setTeacherName(teachers[0]?.name || '');
                  else setTeacherName('');
                }}
                className="text-xs text-sky-600 hover:underline"
              >
                {customTeacher ? 'Escolher da lista' : 'Outro / Digitar'}
              </button>
            </div>
            {customTeacher ? (
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Digite o nome do professor..."
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            ) : (
              <select
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              >
                <option value="">Selecione um professor...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Disciplina */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Disciplina <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCustomSubject(!customSubject);
                  if (customSubject) setSubjectName(subjects[0]?.name || '');
                  else setSubjectName('');
                }}
                className="text-xs text-sky-600 hover:underline"
              >
                {customSubject ? 'Escolher da lista' : 'Outra / Digitar'}
              </button>
            </div>
            {customSubject ? (
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Digite o nome da disciplina..."
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            ) : (
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              >
                <option value="">Selecione uma disciplina...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tipo de Avaliação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Avaliação <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition text-center ${
                    type === t
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações ou Conteúdo (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Capítulos 4 e 5, trazer calculadora, etc."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!conflictCheck.valid}
              className={`px-5 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition ${
                conflictCheck.valid
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              {editAssessment ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
