# MasGO Database Schema (Supabase)

이 문서는 Supabase에서 사용할 테이블 스키마 SQL 문을 관리합니다.

## 1. Profiles Table
사용자 추가 정보를 관리하는 테이블입니다. (Supabase Auth와 연동)

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) 설정
alter table profiles enable row level security;

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);
```

## 2. API Keys Table
사용자별로 생성된 API Secret Key를 관리하는 테이블입니다.

```sql
create table api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  secret_key text not null unique,
  is_active boolean default true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) 설정
alter table api_keys enable row level security;

create policy "Users can manage their own api keys" on api_keys
  for all using (auth.uid() = user_id);
```

## 3. Trigger for Auto Profile Creation
Auth에 회원가입 시 자동으로 profiles 테이블에 데이터를 삽입하는 트리거입니다.

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
