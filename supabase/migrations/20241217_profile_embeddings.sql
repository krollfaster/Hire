-- Миграция: Создание таблицы profile_embeddings для векторного поиска
-- Дата: 2024-12-17
-- Описание: Добавляет поддержку семантического поиска кандидатов через pgvector
-- Модель: sentence-transformers/all-MiniLM-L6-v2 (384 измерения, бесплатно через HuggingFace)

-- Включить расширение pgvector (если ещё не включено)
create extension if not exists vector;

-- Таблица для хранения embeddings профилей пользователей
create table if not exists profile_embeddings (
  id uuid primary key default gen_random_uuid(),
  profession_id uuid not null unique,
  user_id uuid not null,
  content text not null,
  embedding vector(384),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Индекс для быстрого векторного поиска (cosine similarity)
create index if not exists profile_embeddings_embedding_idx 
  on profile_embeddings 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Индекс для поиска по user_id
create index if not exists profile_embeddings_user_id_idx 
  on profile_embeddings(user_id);

-- Функция для поиска похожих профилей по embedding
create or replace function match_profiles(
  query_embedding vector(384),
  match_threshold float default 0.3,
  match_count int default 20
)
returns table (
  profession_id uuid,
  user_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    pe.profession_id,
    pe.user_id,
    pe.content,
    1 - (pe.embedding <=> query_embedding) as similarity
  from profile_embeddings pe
  where pe.embedding is not null
    and 1 - (pe.embedding <=> query_embedding) > match_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
$$;

-- Функция для обновления updated_at при изменении записи
create or replace function update_profile_embeddings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Триггер для автоматического обновления updated_at
drop trigger if exists profile_embeddings_updated_at on profile_embeddings;
create trigger profile_embeddings_updated_at
  before update on profile_embeddings
  for each row
  execute function update_profile_embeddings_updated_at();

-- Функция для вставки или обновления embedding профиля
create or replace function upsert_profile_embedding(
  p_profession_id uuid,
  p_user_id uuid,
  p_content text,
  p_embedding text
)
returns void
language plpgsql
as $$
begin
  insert into profile_embeddings (profession_id, user_id, content, embedding)
  values (p_profession_id, p_user_id, p_content, p_embedding::vector)
  on conflict (profession_id)
  do update set
    content = excluded.content,
    embedding = excluded.embedding,
    updated_at = now();
end;
$$;

-- Комментарии к таблице
comment on table profile_embeddings is 'Хранит векторные представления профилей для семантического поиска';
comment on column profile_embeddings.content is 'Текстовое представление навыков и опыта пользователя';
comment on column profile_embeddings.embedding is 'Векторное представление (384 измерения для sentence-transformers/all-MiniLM-L6-v2)';

