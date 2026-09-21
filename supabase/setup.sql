-- Нить поколений — всё, что нужно выполнить в Supabase, одним файлом.
--
-- Это 0001_init.sql и 0002_subtypes.sql, склеенные вместе, чтобы не
-- выполнять два запроса подряд. Отдельные файлы остаются на месте:
-- при следующих изменениях схемы добавляйте новую миграцию к ним,
-- а этот файл пересобирайте.
--
-- Как применить: панель Supabase → SQL Editor → New query → вставить
-- всё отсюда → Run. Должно ответить «Success. No rows returned».

-- Нить поколений — начальная схема.
-- Три модуля ТЗ: Архив-запись (records), Карта людей (people), Лента дел (tasks).
--
-- Принцип доступа: читать может любой (включая незарегистрированных),
-- писать — только вошедший участник, править и удалять — только автор строки.
-- Носители традиций НЕ регистрируются: носитель — это не аккаунт, а имя
-- рядом с материалом (records.carrier_name). Регистрируется помощник,
-- который приходит к носителю с телефоном и загружает запись.

-- ---------------------------------------------------------------------------
-- Типы
-- ---------------------------------------------------------------------------

create type heritage_type as enum ('song', 'ritual', 'craft', 'oral_history');
create type media_kind as enum ('audio', 'video', 'photo', 'text');
create type person_role as enum ('carrier', 'helper');
create type task_status as enum ('open', 'in_progress', 'done');

-- ---------------------------------------------------------------------------
-- Профили вошедших участников (1:1 с auth.users)
-- ---------------------------------------------------------------------------

create table profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	display_name text not null default '',
	contact text not null default '',
	created_at timestamptz not null default now()
);

comment on column profiles.contact is 'Телефон или @telegram — вместо внутреннего чата, см. ТЗ 4.2';

-- Профиль создаётся автоматически при первом входе, чтобы человек не
-- заполнял анкету до того, как увидел смысл платформы.
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, display_name)
	values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
	return new;
end;
$$;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Модуль 1. Архив-запись
-- ---------------------------------------------------------------------------

create table records (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	type heritage_type not null,
	-- Авторство носителя. NOT NULL осознанно: материал без имени носителя
	-- обезличивает его — это прямо запрещено требованиями проекта.
	carrier_name text not null check (length(trim(carrier_name)) > 0),
	media_kind media_kind not null,
	media_url text,             -- путь в bucket `media`; null для текстовых записей
	body text,                  -- текст записи; null для файловых
	location text not null default '',
	date_recorded date,
	recorded_by uuid references profiles (id) on delete set null,
	created_at timestamptz not null default now(),

	-- либо файл, либо текст — но что-то из этого обязательно
	constraint records_has_content check (
		(media_kind = 'text' and body is not null and length(trim(body)) > 0)
		or (media_kind <> 'text' and media_url is not null)
	)
);

create index records_type_idx on records (type);
create index records_created_at_idx on records (created_at desc);

-- ---------------------------------------------------------------------------
-- Модуль 2. Карта людей
-- ---------------------------------------------------------------------------

create table people (
	id uuid primary key default gen_random_uuid(),
	name text not null check (length(trim(name)) > 0),
	role person_role not null,
	skills_or_knowledge text not null default '',
	skill_tags text[] not null default '{}',
	location text not null default '',
	contact text not null default '',
	-- заполнено, если человек завёл аккаунт сам; у носителей обычно пусто —
	-- их анкету заводит помощник
	profile_id uuid references profiles (id) on delete set null,
	added_by uuid references profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create index people_role_idx on people (role);
create index people_skill_tags_idx on people using gin (skill_tags);

-- ---------------------------------------------------------------------------
-- Модуль 3. Лента маленьких дел
-- ---------------------------------------------------------------------------

create table tasks (
	id uuid primary key default gen_random_uuid(),
	title text not null check (length(trim(title)) > 0),
	description text not null default '',
	-- Срок обязателен: дело без срока перестаёт быть «маленьким делом»
	-- и превращается в абстрактную миссию, которая не работает (ТЗ 5).
	deadline date not null,
	status task_status not null default 'open',
	created_by uuid references profiles (id) on delete set null,
	result_record_id uuid references records (id) on delete set null,
	created_at timestamptz not null default now()
);

create index tasks_status_idx on tasks (status);
create index tasks_deadline_idx on tasks (deadline);

create table task_responders (
	task_id uuid not null references tasks (id) on delete cascade,
	profile_id uuid not null references profiles (id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (task_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- Права доступа (RLS)
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table records enable row level security;
alter table people enable row level security;
alter table tasks enable row level security;
alter table task_responders enable row level security;

-- Читают все: архив открыт, иначе он не выполняет свою задачу —
-- быть видимым результатом работы сообщества.
create policy "читать может любой" on profiles for select using (true);
create policy "читать может любой" on records for select using (true);
create policy "читать может любой" on people for select using (true);
create policy "читать может любой" on tasks for select using (true);
create policy "читать может любой" on task_responders for select using (true);

-- Пишет только вошедший.
create policy "добавляет вошедший" on records for insert
	to authenticated with check (auth.uid() = recorded_by);
create policy "добавляет вошедший" on people for insert
	to authenticated with check (auth.uid() = added_by);
create policy "добавляет вошедший" on tasks for insert
	to authenticated with check (auth.uid() = created_by);

-- Правит и удаляет только автор строки.
create policy "правит автор" on profiles for update
	to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "правит автор" on records for update
	to authenticated using (auth.uid() = recorded_by) with check (auth.uid() = recorded_by);
create policy "удаляет автор" on records for delete
	to authenticated using (auth.uid() = recorded_by);
create policy "правит автор" on people for update
	to authenticated using (auth.uid() = added_by or auth.uid() = profile_id)
	with check (auth.uid() = added_by or auth.uid() = profile_id);
create policy "удаляет автор" on people for delete
	to authenticated using (auth.uid() = added_by);
create policy "удаляет автор" on tasks for delete
	to authenticated using (auth.uid() = created_by);

-- Исключение: статус и результат задачи может менять любой вошедший.
-- Иначе нельзя отметить выполненным чужое дело, к которому ты подключился, —
-- а именно так в сообществе и происходит.
create policy "статус меняет любой вошедший" on tasks for update
	to authenticated using (true) with check (true);

-- RLS даёт доступ ко всей строке целиком, поэтому текст дела защищаем
-- триггером: чужую задачу можно двигать по статусу, но не переписывать.
create function guard_task_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	if auth.uid() is distinct from old.created_by then
		new.title := old.title;
		new.description := old.description;
		new.deadline := old.deadline;
		new.created_by := old.created_by;
	end if;
	return new;
end;
$$;

create trigger tasks_guard_fields
	before update on tasks
	for each row execute function guard_task_fields();

-- Отклик — от своего имени; убрать отклик может только сам откликнувшийся.
create policy "откликается вошедший" on task_responders for insert
	to authenticated with check (auth.uid() = profile_id);
create policy "отзывает отклик сам" on task_responders for delete
	to authenticated using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- Хранилище медиа
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)  -- 50 МБ
on conflict (id) do nothing;

create policy "медиа читают все" on storage.objects for select
	using (bucket_id = 'media');
create policy "медиа загружает вошедший" on storage.objects for insert
	to authenticated with check (bucket_id = 'media');
create policy "медиа удаляет загрузивший" on storage.objects for delete
	to authenticated using (bucket_id = 'media' and auth.uid() = owner);


-- Подразделы внутри типа наследия: у песни, обряда и ремесла их несколько
-- (колыбельные и свадебные — это разные песни), у устной истории нет.
--
-- Здесь text, а не enum: список подразделов будет уточняться по мере того,
-- как люди начнут записывать, и каждая правка не должна требовать миграции.
-- Допустимые значения заданы в src/lib/types.ts и проверяются при сохранении.

alter table records add column subtype text not null default '';

-- Фильтр «песня → колыбельные» — основной способ навигации по архиву,
-- когда записей станет много.
create index records_type_subtype_idx on records (type, subtype);
