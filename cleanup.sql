-- SCRIPT DE LIMPEZA DE DADOS (KEEP ADMINS ONLY)
-- Cole e execute este script no SQL Editor do Supabase para limpar dados de teste,
-- mantendo somente os usuários com perfil de administrador ('admin').

-- 1. Limpar notificações
DELETE FROM public.notifications;

-- 2. Limpar logs de auditoria
DELETE FROM public.audit_logs;

-- 3. Limpar progresso dos módulos
DELETE FROM public.candidate_module_progress;

-- 4. Limpar candidatos
DELETE FROM public.candidates;

-- 5. Deletar usuários da tabela auth.users que NÃO são administradores no perfil público (public.users)
-- A exclusão em auth.users irá se propagar para public.users devido ao ON DELETE CASCADE.
DELETE FROM auth.users 
WHERE id NOT IN (
    SELECT id 
    FROM public.users 
    WHERE role = 'admin'
);

-- 6. Limpar escolas
DELETE FROM public.schools;
