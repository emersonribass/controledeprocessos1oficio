
-- Função para atualizar a senha de um usuário existente
-- Esta função deve ser adicionada ao banco de dados Supabase usando o SQL Editor
CREATE OR REPLACE FUNCTION public.update_user_password(
  usuario_email TEXT,
  nova_senha TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verificar se o usuário existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = usuario_email;
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar senha na tabela auth.users
  BEGIN
    -- Atualizar senha no auth.users
    UPDATE auth.users
    SET encrypted_password = crypt(nova_senha, gen_salt('bf'))
    WHERE id = v_user_id;
    
    -- Atualizar senha na tabela usuarios (para manter consistência)
    UPDATE public.usuarios
    SET senha = nova_senha
    WHERE email = usuario_email;
    
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;
END;
$$;
