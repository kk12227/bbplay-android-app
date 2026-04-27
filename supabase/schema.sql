-- ============================================================
-- BBplay — Supabase Schema
-- Запустить в SQL Editor: app.supabase.com → SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── Profiles ──────────────────────────────────────────────
create table profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text not null unique,
  balance     integer not null default 0 check (balance >= 0),
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Clubs ─────────────────────────────────────────────────
create table clubs (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  address     text not null,
  city        text not null default 'Тамбов',
  open_hours  text not null,
  rating      numeric(2,1) default 5.0,
  image_url   text,
  total_seats integer not null default 0,
  created_at  timestamptz default now()
);

alter table clubs enable row level security;
create policy "Public clubs" on clubs for select to anon, authenticated using (true);

-- ─── Computers ─────────────────────────────────────────────
create table computers (
  id          uuid default uuid_generate_v4() primary key,
  club_id     uuid references clubs on delete cascade not null,
  seat_number integer not null,
  zone        text not null check (zone in ('standard', 'vip', 'cyber')),
  specs       jsonb not null default '{}',
  hourly_rate integer not null,
  status      text not null default 'free' check (status in ('free','busy','reserved','maintenance')),
  created_at  timestamptz default now(),
  unique(club_id, seat_number)
);

alter table computers enable row level security;
create policy "Public computers" on computers for select to anon, authenticated using (true);

-- ─── Bookings ──────────────────────────────────────────────
create table bookings (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references profiles on delete cascade not null,
  computer_id uuid references computers on delete restrict not null,
  club_id     uuid references clubs not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  total_cost  integer not null check (total_cost > 0),
  status      text not null default 'upcoming'
              check (status in ('upcoming','active','completed','cancelled')),
  created_at  timestamptz default now(),
  constraint booking_time_valid check (end_time > start_time)
);

alter table bookings enable row level security;
create policy "Users see own bookings" on bookings for select using (auth.uid() = user_id);
create policy "Users create own bookings" on bookings for insert with check (auth.uid() = user_id);
create policy "Users update own bookings" on bookings for update using (auth.uid() = user_id);

-- Check for overlapping bookings
create or replace function check_booking_overlap()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from bookings
    where computer_id = new.computer_id
      and status not in ('cancelled', 'completed')
      and id != coalesce(new.id, uuid_generate_v4())
      and tstzrange(start_time, end_time, '[)') && tstzrange(new.start_time, new.end_time, '[)')
  ) then
    raise exception 'Время пересекается с существующей бронью';
  end if;
  return new;
end;
$$;
create trigger check_overlap before insert or update on bookings
  for each row execute procedure check_booking_overlap();

-- ─── Transactions ──────────────────────────────────────────
create table transactions (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references profiles on delete cascade not null,
  type        text not null check (type in ('topup','payment','refund')),
  amount      integer not null,
  description text,
  created_at  timestamptz default now()
);

alter table transactions enable row level security;
create policy "Users see own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users create own transactions" on transactions for insert with check (auth.uid() = user_id);

-- ─── Topup function (atomic) ───────────────────────────────
create or replace function topup_balance(
  p_user_id   uuid,
  p_amount    integer,
  p_bonus     integer default 0,
  p_method    text    default 'card'
) returns integer language plpgsql security definer as $$
declare
  total_amount integer := p_amount + p_bonus;
  new_balance  integer;
begin
  update profiles set balance = balance + total_amount
    where id = p_user_id
    returning balance into new_balance;

  insert into transactions (user_id, type, amount, description)
    values (p_user_id, 'topup', total_amount,
      'Пополнение через ' || p_method || case when p_bonus > 0 then ' (бонус +' || p_bonus || ' ₽)' else '' end);

  return new_balance;
end;
$$;

-- ─── Create booking function (atomic) ─────────────────────
create or replace function create_booking(
  p_user_id     uuid,
  p_computer_id uuid,
  p_start       timestamptz,
  p_end         timestamptz,
  p_cost        integer
) returns uuid language plpgsql security definer as $$
declare
  booking_id uuid;
  club_id_val uuid;
begin
  select club_id into club_id_val from computers where id = p_computer_id;

  -- Deduct balance
  update profiles set balance = balance - p_cost
    where id = p_user_id and balance >= p_cost;

  if not found then
    raise exception 'Недостаточно средств';
  end if;

  -- Create booking
  insert into bookings (user_id, computer_id, club_id, start_time, end_time, total_cost)
    values (p_user_id, p_computer_id, club_id_val, p_start, p_end, p_cost)
    returning id into booking_id;

  -- Log transaction
  insert into transactions (user_id, type, amount, description)
    values (p_user_id, 'payment', -p_cost, 'Бронь компьютера');

  return booking_id;
end;
$$;

-- ─── Seed data ─────────────────────────────────────────────
insert into clubs (id, name, address, open_hours, rating, total_seats) values
  ('00000000-0000-0000-0000-000000000001', 'BBplay Central', 'ул. Советская, 155',    '24/7',        4.9, 80),
  ('00000000-0000-0000-0000-000000000002', 'BBplay Arena',   'ул. Мичуринская, 112',  '10:00-02:00', 4.7, 60),
  ('00000000-0000-0000-0000-000000000003', 'BBplay North',   'ул. Студенецкая, 45',   '08:00-00:00', 4.8, 40);
