alter table public.teams drop constraint if exists teams_name_key;
alter table public.teams add constraint teams_name_festival_unique unique (name, festival_id);

insert into public.teams (name, points, published_points, festival_id)
select t.name, 0, 0, f.id
from public.teams t
cross join (select id from public.festivals where year=2026) f
where t.festival_id = (select id from public.festivals where year=2025)
on conflict (name, festival_id) do nothing;

insert into public.settings (key, value, festival_id)
select v.key, v.value, f.id
from (values
  ('team_standings_after_result'::text, '0'::jsonb),
  ('published_up_to_result', '0'::jsonb),
  ('team_standings_visible', 'false'::jsonb)
) as v(key, value)
cross join (select id from public.festivals where year=2026) f
on conflict (key, festival_id) do nothing;

insert into public.settings (key, value, festival_id)
select 'grade_points_map', s.value, (select id from public.festivals where year=2026)
from public.settings s
where s.key='grade_points_map' and s.festival_id=(select id from public.festivals where year=2025)
on conflict (key, festival_id) do nothing;