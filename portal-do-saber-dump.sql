-- Dump do banco Portal do Saber
-- Gerado em 2026-09-25 21:58:22

DROP TABLE IF EXISTS "scheduling_settings" CASCADE;
CREATE TABLE "scheduling_settings" (
  "id" TEXT PRIMARY KEY,
  "medio_start_date" DATE,
  "medio_end_date" DATE,
  "fundamental_start_date" DATE,
  "fundamental_end_date" DATE,
  "blocked_dates" JSONB,
  "created_date" TIMESTAMP,
  "updated_date" TIMESTAMP,
  "created_by_id" TEXT
);

INSERT INTO "scheduling_settings" ("id", "medio_start_date", "medio_end_date", "fundamental_start_date", "fundamental_end_date", "blocked_dates", "created_date", "updated_date", "created_by_id") VALUES ('6ab4467ef2c316303cc283bf', '2026-09-28', '2026-10-31', '2026-10-01', '2026-10-23', '["2026-10-03","2026-10-10","2026-10-11","2026-10-12","2026-10-13","2026-10-14","2026-10-15","2026-10-16","2026-10-17","2026-10-18","2026-10-19","2026-10-20","2026-10-24","2026-10-31"]', '2026-09-23T21:37:02.382000', '2026-09-24T13:01:03.624000', '6ab43e4b49bfa7413ab0b0ad');

DROP TABLE IF EXISTS "teachers" CASCADE;
CREATE TABLE "teachers" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "created_date" TIMESTAMP,
  "updated_date" TIMESTAMP,
  "created_by_id" TEXT
);

INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449942a988978be714146', 'Jorge', '2026-09-23T21:50:12.204000', '2026-09-23T21:50:12.204000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab4498d9db67d7968aae775', 'Vivi', '2026-09-23T21:50:05.690000', '2026-09-23T21:50:05.690000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449871451ebe1fdbceb80', 'Danúbia', '2026-09-23T21:49:59.341000', '2026-09-23T21:49:59.341000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab4497ff6b620d70c7b8e53', 'Hugo', '2026-09-23T21:49:51.367000', '2026-09-23T21:49:51.367000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab44977480602060363c85e', 'Wagner', '2026-09-23T21:49:43.816000', '2026-09-23T21:49:43.816000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab4496995fe7bff0a1ce256', 'Alessandro', '2026-09-23T21:49:29.991000', '2026-09-23T21:49:29.991000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab44962735c45c3684917d5', 'Well', '2026-09-23T21:49:22.649000', '2026-09-23T21:49:22.649000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab4495bd07d236ad38643a0', 'Vangoy', '2026-09-23T21:49:15.506000', '2026-09-23T21:49:15.506000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab44950290b4a9b29f59708', 'Elienay', '2026-09-23T21:49:04.885000', '2026-09-23T21:49:04.885000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab44948c9bf5e75ffd13801', 'José Carlos', '2026-09-23T21:48:56.219000', '2026-09-23T21:48:56.219000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449271f314d0a946ec57c', 'Américo', '2026-09-23T21:48:23.924000', '2026-09-23T21:48:23.924000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab4491f846a730fb1490d91', 'Francisco', '2026-09-23T21:48:15.837000', '2026-09-23T21:48:15.837000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab4491211791e5c2a0e7298', 'Marluza', '2026-09-23T21:48:02.653000', '2026-09-23T21:48:02.653000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449047b87b8700e49d7f5', 'Bruna', '2026-09-23T21:47:48.118000', '2026-09-23T21:47:48.118000', '6ab44126096778ff60aeb5dc');
INSERT INTO "teachers" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab448fa40437c1cb7521d35', 'Grazi', '2026-09-23T21:47:38.831000', '2026-09-23T21:47:38.831000', '6ab44126096778ff60aeb5dc');

DROP TABLE IF EXISTS "subjects" CASCADE;
CREATE TABLE "subjects" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "created_date" TIMESTAMP,
  "updated_date" TIMESTAMP,
  "created_by_id" TEXT
);

INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab4ebfefce753c68780e526', 'Artes', '2026-09-24T09:23:10.905000', '2026-09-24T09:23:10.905000', '6ab4ebd6258dca0ab03b43b6');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449cb82421bffe295b50b', 'Literatura', '2026-09-23T21:51:07.914000', '2026-09-23T21:51:07.914000', '6ab44126096778ff60aeb5dc');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449c62575d44ff1a4c252', 'Redação', '2026-09-23T21:51:02.814000', '2026-09-23T21:51:02.814000', '6ab44126096778ff60aeb5dc');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449bd0155673cfa33d681', 'Educação Física', '2026-09-23T21:50:53.577000', '2026-09-23T21:50:53.577000', '6ab44126096778ff60aeb5dc');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449b6d8bceee521610d9e', 'Educação Digital', '2026-09-23T21:50:46.770000', '2026-09-23T21:50:46.770000', '6ab44126096778ff60aeb5dc');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449b0a1524be9194137a2', 'Educação Financeira', '2026-09-23T21:50:40.385000', '2026-09-23T21:50:40.385000', '6ab44126096778ff60aeb5dc');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab449a84b61b19ab22847a6', 'Espanhol', '2026-09-23T21:50:32.526000', '2026-09-23T21:50:32.526000', '6ab44126096778ff60aeb5dc');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c9698', 'Português', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c969e', 'Inglês', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c969d', 'Química', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c9697', 'Matemática', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c9699', 'História', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c969b', 'Biologia', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c969c', 'Física', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "subjects" ("id", "name", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa124c5cba92b4c969a', 'Geografia', '2026-09-23T21:07:45.015000', '2026-09-23T21:07:45.015000', '6ab43e4b49bfa7413ab0b0ad');

DROP TABLE IF EXISTS "school_classes" CASCADE;
CREATE TABLE "school_classes" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "level" TEXT,
  "created_date" TIMESTAMP,
  "updated_date" TIMESTAMP,
  "created_by_id" TEXT
);

INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab447288b687e78679c9e93', '7º Ano', 'Ensino Fundamental', '2026-09-23T21:39:52.478000', '2026-09-24T09:08:21.339000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab44722a75e0ec2cfae7246', '6º Ano', 'Ensino Fundamental', '2026-09-23T21:39:46.742000', '2026-09-24T09:08:21.339000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa175fd9e31ee6c980c', '1ª Série', 'Ensino Médio', '2026-09-23T21:07:45.256000', '2026-09-24T09:24:06.290000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa175fd9e31ee6c980b', '9º Ano', 'Ensino Fundamental', '2026-09-23T21:07:45.256000', '2026-09-24T09:08:21.339000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa175fd9e31ee6c980d', '2ª Série', 'Ensino Médio', '2026-09-23T21:07:45.256000', '2026-09-24T09:24:00.538000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa175fd9e31ee6c980e', '3ª Série', 'Ensino Médio', '2026-09-23T21:07:45.256000', '2026-09-24T09:23:52.247000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa175fd9e31ee6c9809', '8º Ano 1', 'Ensino Fundamental', '2026-09-23T21:07:45.256000', '2026-09-24T09:08:21.339000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "school_classes" ("id", "name", "level", "created_date", "updated_date", "created_by_id") VALUES ('6ab43fa175fd9e31ee6c980a', '8º Ano 2', 'Ensino Fundamental', '2026-09-23T21:07:45.256000', '2026-09-24T09:08:21.339000', '6ab43e4b49bfa7413ab0b0ad');

DROP TABLE IF EXISTS "assessments" CASCADE;
CREATE TABLE "assessments" (
  "id" TEXT PRIMARY KEY,
  "date" DATE,
  "teacher_name" TEXT,
  "teacher_id" TEXT,
  "subject" TEXT,
  "class_name" TEXT,
  "type" TEXT,
  "notes" TEXT,
  "created_date" TIMESTAMP,
  "updated_date" TIMESTAMP,
  "created_by_id" TEXT
);

INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab717ba1557aca868987042', '2026-10-07', 'Elienay', '6ab44950290b4a9b29f59708', 'Matemática', '1ª Série', 'Avaliação', '', '2026-09-26T00:54:18.111000', '2026-09-26T00:54:18.111000', '6ab43e4b49bfa7413ab0b0ad');
INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab5cebcfdfc0a86a8054b75', '2026-10-21', 'Elienay', '6ab44950290b4a9b29f59708', 'Matemática', '8º Ano 1', 'Avaliação', '', '2026-09-25T01:30:36.877000', '2026-09-25T01:30:36.877000', 'anonymous');
INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab5305c5681601da37aecb1', '2026-10-06', 'Vivi', '6ab4498d9db67d7968aae775', 'Inglês', '2ª Série', 'Simulado', '', '2026-09-24T14:14:52.870000', '2026-09-24T14:14:52.870000', 'anonymous');
INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab53035851d77a9609ca2c0', '2026-10-06', 'Vivi', '6ab4498d9db67d7968aae775', 'Inglês', '1ª Série', 'Simulado', '', '2026-09-24T14:14:13.409000', '2026-09-24T14:14:13.409000', 'anonymous');
INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab51f78cbcf1749632aaaf3', '2026-10-02', 'Francisco', '6ab4491f846a730fb1490d91', 'Química', '2ª Série', 'Simulado', '', '2026-09-24T13:02:48.309000', '2026-09-24T13:02:48.309000', '6ab4f4c98c9868e53e2d74f7');
INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab51f512cd0f671969286e4', '2026-10-02', 'Francisco', '6ab4491f846a730fb1490d91', 'Química', '1ª Série', 'Simulado', '', '2026-09-24T13:02:09.790000', '2026-09-24T13:02:09.790000', '6ab4f4c98c9868e53e2d74f7');
INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab51f325e5f1d42478b1152', '2026-10-05', 'Jorge', '6ab449942a988978be714146', 'Português', '2ª Série', 'Simulado', '', '2026-09-24T13:01:38.961000', '2026-09-24T13:01:38.961000', '6ab4f4c98c9868e53e2d74f7');
INSERT INTO "assessments" ("id", "date", "teacher_name", "teacher_id", "subject", "class_name", "type", "notes", "created_date", "updated_date", "created_by_id") VALUES ('6ab509a88de909bdcbfbc8c5', '2026-10-05', 'Jorge', '6ab449942a988978be714146', 'Português', '1ª Série', 'Simulado', '', '2026-09-24T11:29:44.392000', '2026-09-24T11:29:44.392000', '6ab4f4c98c9868e53e2d74f7');

DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "full_name" TEXT,
  "email" TEXT,
  "role" TEXT,
  "created_date" TIMESTAMP,
  "updated_date" TIMESTAMP
);

INSERT INTO "users" ("id", "full_name", "email", "role", "created_date", "updated_date") VALUES ('6ab4f4c98c9868e53e2d74f7', 'Jorge Tadeu', 'jorgetadeu53@gmail.com', 'admin', '2026-09-24T10:00:41.612000Z', '2026-09-24T10:00:41.612000Z');
INSERT INTO "users" ("id", "full_name", "email", "role", "created_date", "updated_date") VALUES ('6ab4eee252abe2cb31a8ac80', 'NTE 29 TeamViewer', 'nte29.teamviewer@educacao.mg.gov.br', 'user', '2026-09-24T09:35:30.397000Z', '2026-09-24T09:35:30.397000Z');
INSERT INTO "users" ("id", "full_name", "email", "role", "created_date", "updated_date") VALUES ('6ab4ebd6258dca0ab03b43b6', 'SRE CARANGOLA COORDENACAO', 'nte29.coord@educacao.mg.gov.br', 'admin', '2026-09-24T09:22:30.259000Z', '2026-09-24T09:22:30.259000Z');
INSERT INTO "users" ("id", "full_name", "email", "role", "created_date", "updated_date") VALUES ('6ab44126096778ff60aeb5dc', 'Elienay Hemerson', 'elienayhemerson@gmail.com', 'admin', '2026-09-23T21:14:14.301000Z', '2026-09-23T21:27:47.628000Z');
INSERT INTO "users" ("id", "full_name", "email", "role", "created_date", "updated_date") VALUES ('6ab4410763809bb90163fcc0', 'Elienay Hemerson', 'elienay@portaldosaber.com', 'user', '2026-09-23T21:13:43.985000Z', '2026-09-23T21:13:43.985000Z');
INSERT INTO "users" ("id", "full_name", "email", "role", "created_date", "updated_date") VALUES ('6ab43e4b49bfa7413ab0b0ad', 'Elienay Hemerson', 'elienay.domingues@educacao.mg.gov.br', 'admin', '2026-09-23T21:02:03.401000Z', '2026-09-23T21:02:03.401000Z');

