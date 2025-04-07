
-- Criar uma função para listar usuários (simulando admin.listUsers)
CREATE OR REPLACE FUNCTION auth.admin_list_users(filter jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data
  FROM auth.users u
  WHERE 
    (filter->>'email' IS NULL OR u.email = filter->>'email');
END;
$$ LANGUAGE plpgsql;

-- Permitir que usuários autenticados possam usar esta função
GRANT EXECUTE ON FUNCTION auth.admin_list_users TO authenticated;

-- Criar função para deletar usuários (simulando admin.deleteUser)
CREATE OR REPLACE FUNCTION auth.admin_delete_user(user_id uuid)
RETURNS boolean
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Permitir que usuários autenticados possam usar esta função
GRANT EXECUTE ON FUNCTION auth.admin_delete_user TO authenticated;
