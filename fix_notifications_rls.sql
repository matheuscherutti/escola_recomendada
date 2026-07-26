-- Permite que usuários atualizem o status de leitura (is_read) das notificações
DROP POLICY IF EXISTS "Allow update notifications for all" ON notifications;

CREATE POLICY "Allow update notifications for all" ON notifications 
  FOR UPDATE USING (true);
