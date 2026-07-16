-- SUPABASE MIGRATION SCRIPT
-- Cole e execute este script completo no SQL Editor do Supabase.
-- ATENÇÃO: Isso limpará e recriará as tabelas para suportar autenticação nativa por UUID.

-- 1. Remover tabelas antigas (limpeza limpa)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS candidate_module_progress CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- 2. Recriar Tabela: schools
CREATE TABLE schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cnpj TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Recriar Tabela: users (Perfis Públicos vinculados ao auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'school_admin')),
    school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Recriar Tabela: candidates
CREATE TABLE candidates (
    id TEXT PRIMARY KEY,
    re TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    anac TEXT UNIQUE NOT NULL,
    school_id TEXT REFERENCES schools(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending_validation', 'rejected', 'in_progress', 'completed')),
    selection_status TEXT NOT NULL CHECK (selection_status IN ('finalized', 'in_selection', 'hired')),
    gupy_status TEXT CHECK (gupy_status IN ('gupy_min', 'gupy_no_min', 'not_gupy')),
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Recriar Tabela: candidate_module_progress
CREATE TABLE candidate_module_progress (
    id TEXT PRIMARY KEY,
    candidate_id TEXT REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
    module_code TEXT NOT NULL CHECK (module_code IN ('TEORICO', 'SIMULADOR', 'VOO')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'waiting_admin', 'completed')),
    completion_date DATE,
    school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
    certificate_url TEXT,
    class_sheets TEXT[],
    uploaded_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(candidate_id, module_code)
);

-- 6. Recriar Tabela: audit_logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT,
    candidate_id TEXT,
    candidate_name TEXT,
    changed_field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT
);

-- 7. Recriar Tabela: notifications
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
    recipient_role TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pending_validation', 'validation_result', 'course_completed', 'selection_status_update')),
    candidate_id TEXT REFERENCES candidates(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 8. Inserir Dados Iniciais de Escolas (Mock de Escolas Recomendadas)
INSERT INTO schools (id, name, cnpj, active, contact_name, email, phone) VALUES
('sch-alfa', 'Escola Recomendada Alfa', '12345678000199', true, 'Renato Silva', 'contato@escolaalfa.com.br', '11999998888'),
('sch-beta', 'Escola Recomendada Beta', '98765432000188', true, 'Ana Souza', 'contato@escolabeta.com.br', '11988887777');

-- 9. Função e Trigger para Cadastro Automático do Perfil Público
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, school_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário Novo'),
    'school_admin', -- Padrão inicial
    NULL -- Será associado a uma escola pelo administrador da Azul
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Funções Auxiliares para Políticas RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS text AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 11. Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 12. Políticas de Segurança (RLS Policies)

-- Tabela: schools
CREATE POLICY "Public select on schools" ON schools FOR SELECT USING (active = true);
CREATE POLICY "Admin full access on schools" ON schools FOR ALL USING (is_admin());

-- Tabela: users
CREATE POLICY "Allow select own user or admin select all" ON users FOR SELECT 
  USING (auth.uid() = id OR is_admin());
CREATE POLICY "Admin full access on users" ON users FOR UPDATE USING (is_admin());

-- Tabela: candidates
CREATE POLICY "Allow select own school candidates or admin select all" ON candidates FOR SELECT 
  USING (school_id = get_user_school_id() OR is_admin());
CREATE POLICY "Allow insert own school candidates or admin select all" ON candidates FOR INSERT 
  WITH CHECK (school_id = get_user_school_id() OR is_admin());
CREATE POLICY "Allow update own school candidates or admin select all" ON candidates FOR UPDATE 
  USING (school_id = get_user_school_id() OR is_admin());
CREATE POLICY "Admin delete candidates" ON candidates FOR DELETE USING (is_admin());

-- Tabela: candidate_module_progress
CREATE POLICY "Allow select own school modules or admin select all" ON candidate_module_progress FOR SELECT 
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE school_id = get_user_school_id()) OR is_admin()
  );
CREATE POLICY "Allow update own school modules or admin select all" ON candidate_module_progress FOR UPDATE 
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE school_id = get_user_school_id()) OR is_admin()
  );
CREATE POLICY "Allow insert own school modules or admin insert all" ON candidate_module_progress FOR INSERT
  WITH CHECK (
    candidate_id IN (SELECT id FROM candidates WHERE school_id = get_user_school_id()) OR is_admin()
  );

-- Tabela: audit_logs
CREATE POLICY "Admin select logs" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "Allow insert logs for authenticated users" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Tabela: notifications
CREATE POLICY "Select own notifications" ON notifications FOR SELECT 
  USING (
    recipient_user_id = auth.uid() OR 
    recipient_school_id = get_user_school_id() OR 
    (recipient_role = 'admin' AND is_admin())
  );
CREATE POLICY "Allow insert notifications for authenticated users" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update own notifications" ON notifications FOR UPDATE 
  USING (
    recipient_user_id = auth.uid() OR 
    recipient_school_id = get_user_school_id() OR 
    (recipient_role = 'admin' AND is_admin())
  );

-- 13. Função para Redefinição Direta de Senha pelo Administrador (Ignora Limites de SMTP/E-mail)
CREATE OR REPLACE FUNCTION public.reset_user_password_admin(user_id UUID, new_password TEXT)
RETURNS void AS $$
BEGIN
  -- Apenas admins podem executar (segurança de nível de banco de dados)
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem redefinir senhas.';
  END IF;

  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

