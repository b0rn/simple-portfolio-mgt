-- Remove Supabase auth triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_update_user();
DROP FUNCTION IF EXISTS public.handle_delete_user();
DROP FUNCTION IF EXISTS public.handle_new_user();
