-- SCRIPT DE CORREÇÃO COMPLETO PARA SUPABASE SQL EDITOR
-- Remove temporariamente as políticas dependentes e Foreign Keys antes de alterar os tipos das colunas.

-- 1. Remover políticas RLS que dependem do id do usuário
DROP POLICY IF EXISTS "Allow select own user or admin select all" ON users;
DROP POLICY IF EXISTS "Select own notifications" ON notifications;
DROP POLICY IF EXISTS "Update own notifications" ON notifications;

-- 2. Remover Foreign Keys vinculadas ao UUID de users(id)
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_validated_by_fkey;
ALTER TABLE candidate_module_progress DROP CONSTRAINT IF EXISTS candidate_module_progress_updated_by_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_recipient_user_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Alterar os tipos das colunas para TEXT (suporta tanto UUIDs nativos quanto IDs 'usr-xxx')
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE candidates ALTER COLUMN validated_by TYPE TEXT;
ALTER TABLE candidate_module_progress ALTER COLUMN updated_by TYPE TEXT;
ALTER TABLE audit_logs ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE notifications ALTER COLUMN recipient_user_id TYPE TEXT;

-- 4. Recriar as políticas RLS com casting ::text
CREATE POLICY "Allow select own user or admin select all" ON users FOR SELECT 
  USING (auth.uid()::text = id OR is_admin());

CREATE POLICY "Select own notifications" ON notifications FOR SELECT 
  USING (
    recipient_user_id = auth.uid()::text OR 
    recipient_school_id = get_user_school_id() OR 
    (recipient_role = 'admin' AND is_admin())
  );

CREATE POLICY "Update own notifications" ON notifications FOR UPDATE 
  USING (
    recipient_user_id = auth.uid()::text OR 
    recipient_school_id = get_user_school_id() OR 
    (recipient_role = 'admin' AND is_admin())
  );
