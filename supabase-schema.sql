-- Cruz del Sur · Sistema de Turnos
-- Ejecutar en el SQL Editor de Supabase (proyecto Pro)

-- ============ TABLAS ============

-- Especialidades
create table especialidades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  duracion_turno int default 30,
  color text default '#4D8EA2',
  activa boolean default true,
  created_at timestamptz default now()
);

-- Profesionales
create table profesionales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  especialidad_id uuid references especialidades(id),
  activo boolean default true,
  created_at timestamptz default now()
);

-- Disponibilidad (horarios por día de semana)
create table disponibilidad (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid references profesionales(id),
  dia_semana int check (dia_semana between 1 and 6), -- 1=lunes, 6=sábado
  hora_inicio time not null,
  hora_fin time not null
);

-- Pacientes
create table pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  dni text,
  telefono text,
  email text,
  obra_social text,
  created_at timestamptz default now()
);

-- Turnos
create table turnos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id),
  profesional_id uuid references profesionales(id),
  especialidad_id uuid references especialidades(id),
  fecha date not null,
  hora time not null,
  motivo text,
  estado text default 'pendiente' check (estado in ('pendiente','confirmado','cancelado','reprogramado')),
  token text unique default encode(gen_random_bytes(12), 'hex'),
  notas_internas text,
  created_at timestamptz default now()
);

-- ============ SEED DATA ============

-- Insertar especialidad odontología
insert into especialidades (nombre, duracion_turno, color) values
  ('Odontología', 30, '#4D8EA2');

-- Insertar las 5 profesionales
insert into profesionales (nombre, apellido, especialidad_id) values
  ('Valentina', 'Martínez', (select id from especialidades where nombre='Odontología')),
  ('Lucía', 'Fernández', (select id from especialidades where nombre='Odontología')),
  ('Carolina', 'Ríos', (select id from especialidades where nombre='Odontología')),
  ('Sofía', 'Gómez', (select id from especialidades where nombre='Odontología')),
  ('Natalia', 'Herrera', (select id from especialidades where nombre='Odontología'));

-- Disponibilidad lunes a viernes 8-12 y 14-18 para todas
insert into disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin)
select p.id, d.dia, '08:00', '12:00'
from profesionales p, (values (1),(2),(3),(4),(5)) as d(dia);

insert into disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin)
select p.id, d.dia, '14:00', '18:00'
from profesionales p, (values (1),(2),(3),(4),(5)) as d(dia);

-- Algunos pacientes de ejemplo
insert into pacientes (nombre, apellido, dni, telefono, obra_social) values
  ('Juan', 'García', '38500001', '2215551234', 'IOMA'),
  ('Ana', 'Martínez', '39200002', '2214445678', 'OSDE'),
  ('Carlos', 'Díaz', '37800003', '2213339999', 'Particular'),
  ('Sofía', 'Romero', '40100004', '2217772222', 'PAMI'),
  ('Martín', 'López', '36500005', '2218883333', 'IOMA');

-- Turnos de ejemplo para hoy, para que el dashboard de secretaría y la
-- agenda de las profesionales no arranquen vacíos en la demo.
insert into turnos (paciente_id, profesional_id, especialidad_id, fecha, hora, motivo, estado)
values
  ((select id from pacientes where dni = '38500001'),
   (select id from profesionales where nombre = 'Valentina'),
   (select id from especialidades where nombre = 'Odontología'),
   current_date, '09:00', 'Control', 'confirmado'),
  ((select id from pacientes where dni = '39200002'),
   null,
   (select id from especialidades where nombre = 'Odontología'),
   current_date, '10:30', 'Limpieza', 'pendiente'),
  ((select id from pacientes where dni = '37800003'),
   null,
   (select id from especialidades where nombre = 'Odontología'),
   current_date, '11:00', 'Dolor', 'pendiente'),
  ((select id from pacientes where dni = '40100004'),
   null,
   (select id from especialidades where nombre = 'Odontología'),
   current_date, '15:00', 'Consulta', 'pendiente'),
  ((select id from pacientes where dni = '36500005'),
   null,
   (select id from especialidades where nombre = 'Odontología'),
   current_date, '16:30', 'Urgencia', 'pendiente');

-- ============ ROW LEVEL SECURITY ============
-- Demo sin auth: acceso público de lectura/escritura para poder mostrar
-- la turnera, el dashboard de secretaría y la agenda sin login.
-- Antes de ir a producción, reemplazar por políticas basadas en auth.

alter table especialidades enable row level security;
alter table profesionales enable row level security;
alter table disponibilidad enable row level security;
alter table pacientes enable row level security;
alter table turnos enable row level security;

create policy "Lectura pública" on especialidades for select using (true);
create policy "Lectura pública" on profesionales for select using (true);
create policy "Lectura pública" on disponibilidad for select using (true);

create policy "Lectura pública" on pacientes for select using (true);
create policy "Escritura pública" on pacientes for insert with check (true);

create policy "Lectura pública" on turnos for select using (true);
create policy "Escritura pública" on turnos for insert with check (true);
create policy "Actualización pública" on turnos for update using (true);

-- Las políticas RLS solo filtran filas; el rol anon también necesita el
-- GRANT a nivel de tabla (Supabase lo hace solo cuando creás tablas desde
-- la UI del dashboard, pero no cuando corrés SQL crudo como este archivo).
grant usage on schema public to anon, authenticated;

grant select on especialidades to anon, authenticated;
grant select on profesionales to anon, authenticated;
grant select on disponibilidad to anon, authenticated;

grant select, insert on pacientes to anon, authenticated;

grant select, insert, update on turnos to anon, authenticated;
