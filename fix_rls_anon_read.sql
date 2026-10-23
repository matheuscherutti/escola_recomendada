-- Permite leitura pública nas tabelas de dados principais
-- Isso é necessário porque o sistema usa sessões locais (localStorage) além do Supabase Auth
-- A segurança de escrita continua protegida pelas outras políticas existentes

-- Candidatos: leitura pública (sem dados sensíveis de PII)
CREATE POLICY "Allow anon read candidates" ON candidates 
  FOR SELECT USING (true);

-- Progresso de módulos: leitura pública
CREATE POLICY "Allow anon read module progress" ON candidate_module_progress 
  FOR SELECT USING (true);

-- Logs de auditoria: leitura pública (já existem dados não sensíveis)
CREATE POLICY "Allow anon read audit logs" ON audit_logs 
  FOR SELECT USING (true);

-- Notificações: leitura pública
CREATE POLICY "Allow anon read notifications" ON notifications 
  FOR SELECT USING (true);
