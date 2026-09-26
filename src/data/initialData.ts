import { Assessment, SchoolClass, SchedulingSettings, Subject, Teacher, User } from '../types';

export const INITIAL_SETTINGS: SchedulingSettings = {
  id: '6ab4467ef2c316303cc283bf',
  medio_start_date: '2026-09-28',
  medio_end_date: '2026-10-31',
  fundamental_start_date: '2026-10-01',
  fundamental_end_date: '2026-10-23',
  blocked_dates: [
    '2026-10-03',
    '2026-10-10',
    '2026-10-11',
    '2026-10-12',
    '2026-10-13',
    '2026-10-14',
    '2026-10-15',
    '2026-10-16',
    '2026-10-17',
    '2026-10-18',
    '2026-10-19',
    '2026-10-20',
    '2026-10-24',
    '2026-10-31'
  ],
  notice_message: 'Consulte a programação letiva ou agende sua avaliação. Para garantir a qualidade pedagógica, o sistema assegura automaticamente o limite de 1 avaliação por turma ao dia.',
  created_date: '2026-09-23T21:37:02.382000',
  updated_date: '2026-09-24T13:01:03.624000',
  created_by_id: '6ab43e4b49bfa7413ab0b0ad'
};

export const INITIAL_TEACHERS: Teacher[] = [
  { id: '6ab449942a988978be714146', name: 'Jorge' },
  { id: '6ab4498d9db67d7968aae775', name: 'Vivi' },
  { id: '6ab449871451ebe1fdbceb80', name: 'Danúbia' },
  { id: '6ab4497ff6b620d70c7b8e53', name: 'Hugo' },
  { id: '6ab44977480602060363c85e', name: 'Wagner' },
  { id: '6ab4496995fe7bff0a1ce256', name: 'Alessandro' },
  { id: '6ab44962735c45c3684917d5', name: 'Well' },
  { id: '6ab4495bd07d236ad38643a0', name: 'Vangoy' },
  { id: '6ab44950290b4a9b29f59708', name: 'Elienay' },
  { id: '6ab44948c9bf5e75ffd13801', name: 'José Carlos' },
  { id: '6ab449271f314d0a946ec57c', name: 'Américo' },
  { id: '6ab4491f846a730fb1490d91', name: 'Francisco' },
  { id: '6ab4491211791e5c2a0e7298', name: 'Marluza' },
  { id: '6ab449047b87b8700e49d7f5', name: 'Bruna' },
  { id: '6ab448fa40437c1cb7521d35', name: 'Grazi' }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '6ab4ebfefce753c68780e526', name: 'Artes' },
  { id: '6ab449cb82421bffe295b50b', name: 'Literatura' },
  { id: '6ab449c62575d44ff1a4c252', name: 'Redação' },
  { id: '6ab449bd0155673cfa33d681', name: 'Educação Física' },
  { id: '6ab449b6d8bceee521610d9e', name: 'Educação Digital' },
  { id: '6ab449b0a1524be9194137a2', name: 'Educação Financeira' },
  { id: '6ab449a84b61b19ab22847a6', name: 'Espanhol' },
  { id: '6ab43fa124c5cba92b4c9698', name: 'Português' },
  { id: '6ab43fa124c5cba92b4c969e', name: 'Inglês' },
  { id: '6ab43fa124c5cba92b4c969d', name: 'Química' },
  { id: '6ab43fa124c5cba92b4c9697', name: 'Matemática' },
  { id: '6ab43fa124c5cba92b4c9699', name: 'História' },
  { id: '6ab43fa124c5cba92b4c969b', name: 'Biologia' },
  { id: '6ab43fa124c5cba92b4c969c', name: 'Física' },
  { id: '6ab43fa124c5cba92b4c969a', name: 'Geografia' }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  { id: '6ab447288b687e78679c9e93', name: '7º Ano', level: 'Ensino Fundamental' },
  { id: '6ab44722a75e0ec2cfae7246', name: '6º Ano', level: 'Ensino Fundamental' },
  { id: '6ab43fa175fd9e31ee6c980c', name: '1ª Série', level: 'Ensino Médio' },
  { id: '6ab43fa175fd9e31ee6c980b', name: '9º Ano', level: 'Ensino Fundamental' },
  { id: '6ab43fa175fd9e31ee6c980d', name: '2ª Série', level: 'Ensino Médio' },
  { id: '6ab43fa175fd9e31ee6c980e', name: '3ª Série', level: 'Ensino Médio' },
  { id: '6ab43fa175fd9e31ee6c9809', name: '8º Ano 1', level: 'Ensino Fundamental' },
  { id: '6ab43fa175fd9e31ee6c980a', name: '8º Ano 2', level: 'Ensino Fundamental' }
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: '6ab717ba1557aca868987042',
    date: '2026-10-07',
    teacher_name: 'Elienay',
    teacher_id: '6ab44950290b4a9b29f59708',
    subject: 'Matemática',
    class_name: '1ª Série',
    type: 'Avaliação',
    notes: 'Avaliação bimestral de Álgebra e Funções'
  },
  {
    id: '6ab5cebcfdfc0a86a8054b75',
    date: '2026-10-21',
    teacher_name: 'Elienay',
    teacher_id: '6ab44950290b4a9b29f59708',
    subject: 'Matemática',
    class_name: '8º Ano 1',
    type: 'Avaliação',
    notes: 'Geometria espacial e plana'
  },
  {
    id: '6ab5305c5681601da37aecb1',
    date: '2026-10-06',
    teacher_name: 'Vivi',
    teacher_id: '6ab4498d9db67d7968aae775',
    subject: 'Inglês',
    class_name: '2ª Série',
    type: 'Simulado',
    notes: 'Simulado preparatório Enem / Interpretação textual'
  },
  {
    id: '6ab53035851d77a9609ca2c0',
    date: '2026-10-06',
    teacher_name: 'Vivi',
    teacher_id: '6ab4498d9db67d7968aae775',
    subject: 'Inglês',
    class_name: '1ª Série',
    type: 'Simulado',
    notes: 'Grammar and reading comprehension'
  },
  {
    id: '6ab51f78cbcf1749632aaaf3',
    date: '2026-10-02',
    teacher_name: 'Francisco',
    teacher_id: '6ab4491f846a730fb1490d91',
    subject: 'Química',
    class_name: '2ª Série',
    type: 'Simulado',
    notes: 'Termoquímica e Soluções'
  },
  {
    id: '6ab51f512cd0f671969286e4',
    date: '2026-10-02',
    teacher_name: 'Francisco',
    teacher_id: '6ab4491f846a730fb1490d91',
    subject: 'Química',
    class_name: '1ª Série',
    type: 'Simulado',
    notes: 'Tabela Periódica e Ligações Químicas'
  },
  {
    id: '6ab51f325e5f1d42478b1152',
    date: '2026-10-05',
    teacher_name: 'Jorge',
    teacher_id: '6ab449942a988978be714146',
    subject: 'Português',
    class_name: '2ª Série',
    type: 'Simulado',
    notes: 'Sintaxe e Figuras de Linguagem'
  },
  {
    id: '6ab509a88de909bdcbfbc8c5',
    date: '2026-10-05',
    teacher_name: 'Jorge',
    teacher_id: '6ab449942a988978be714146',
    subject: 'Português',
    class_name: '1ª Série',
    type: 'Simulado',
    notes: 'Morfologia e concordância'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: '6ab44126096778ff60aeb5dc',
    full_name: 'Elienay Hemerson',
    email: 'elienayhemerson@gmail.com',
    role: 'super_admin',
    password: 'admin'
  },
  {
    id: '6ab44126096778ff60aeb5dd',
    full_name: 'Elienay Domingues',
    email: 'elienay.domingues@educacao.mg.gov.br',
    role: 'super_admin',
    password: 'admin'
  },
  {
    id: '6ab4ebd6258dca0ab03b43b6',
    full_name: 'SRE CARANGOLA COORDENACAO',
    email: 'nte29.coord@educacao.mg.gov.br',
    role: 'admin',
    password: 'admin'
  },
  {
    id: '6ab4f4c98c9868e53e2d74f7',
    full_name: 'Jorge Tadeu',
    email: 'jorgetadeu53@gmail.com',
    role: 'admin',
    password: 'admin'
  },
  {
    id: '6ab4eee252abe2cb31a8ac80',
    full_name: 'NTE 29 TeamViewer',
    email: 'nte29.teamviewer@educacao.mg.gov.br',
    role: 'user'
  },
  {
    id: '6ab4410763809bb90163fcc0',
    full_name: 'Elienay (Portal do Saber)',
    email: 'elienay@portaldosaber.com',
    role: 'user'
  }
];
