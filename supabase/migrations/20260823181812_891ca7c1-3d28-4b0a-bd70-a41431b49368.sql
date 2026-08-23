ALTER TABLE public.settings DROP CONSTRAINT settings_key_key;
ALTER TABLE public.settings ADD CONSTRAINT settings_key_festival_unique UNIQUE (key, festival_id);