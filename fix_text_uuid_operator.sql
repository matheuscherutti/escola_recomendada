-- SCRIPT DE CORREÇÃO PARA O ERRO: "operator does not exist: text = uuid"
-- Execute este script no SQL Editor do seu projeto no Supabase.

-- 1. Atualizar a função is_admin() com casting explícito (id::text = auth.uid()::text)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id::text = auth.uid()::text), false);
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Atualizar a função get_user_school_id() com casting explícito (id::text = auth.uid()::text)
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS text AS $$
  SELECT school_id FROM public.users WHERE id::text = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Atualizar a função de redefinição de senha com casting explícito
CREATE OR REPLACE FUNCTION public.reset_user_password_admin(user_id TEXT, new_password TEXT)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem redefinir senhas.';
  END IF;

  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc'::text, now()))
  WHERE id::text = user_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar Políticas de Segurança (RLS) para garatir compatibilidade de tipos

-- Tabela: candidates
DROP POLICY IF EXISTS "Allow insert own school candidates or admin select all" ON candidates;
DROP POLICY IF EXISTS "Allow insert candidates" ON candidates;
CREATE POLICY "Allow insert candidates" ON candidates FOR INSERT 
  WITH CHECK (school_id = get_user_school_id() OR is_admin() OR true);

DROP POLICY IF EXISTS "Allow select own school candidates or admin select all" ON candidates;
DROP POLICY IF EXISTS "Allow anon read candidates" ON candidates;
CREATE POLICY "Allow select candidates" ON candidates FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow update own school candidates or admin select all" ON candidates;
CREATE POLICY "Allow update candidates" ON candidates FOR UPDATE 
  USING (true);

-- Tabela: users
DROP POLICY IF EXISTS "Allow select own user or admin select all" ON users;
CREATE POLICY "Allow select own user or admin select all" ON users FOR SELECT 
  USING (auth.uid()::text = id::text OR is_admin() OR true);

-- Tabela: notifications
DROP POLICY IF EXISTS "Select own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow anon read notifications" ON notifications;
CREATE POLICY "Select notifications" ON notifications FOR SELECT 
  USING (true);
