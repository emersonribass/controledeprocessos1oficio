
-- Modificar a função migrate_usuario_to_auth para garantir sincronização de IDs
CREATE OR REPLACE FUNCTION public.migrate_usuario_to_auth(usuario_email text, usuario_senha text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_usuario_id UUID;
BEGIN
  -- Verificar se o usuário já existe na tabela auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = usuario_email;
  
  -- Verificar o ID atual na tabela usuarios
  SELECT id INTO v_usuario_id FROM public.usuarios WHERE email = usuario_email;
  
  IF v_user_id IS NULL THEN
    -- Inserir na tabela auth.users apenas se não existir
    v_user_id := extensions.uuid_generate_v4();
    
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      usuario_email,
      crypt(usuario_senha, gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      NOW(),
      NOW()
    );
  END IF;
  
  -- Independentemente se criamos um novo usuário ou não,
  -- atualizamos a tabela usuarios para garantir que o ID corresponda
  UPDATE public.usuarios 
  SET id = v_user_id, 
      auth_sincronizado = true 
  WHERE email = usuario_email;
  
  RETURN v_user_id;
END;
$function$;

-- Adicionar também uma nova função para garantir que os IDs estejam sincronizados
CREATE OR REPLACE FUNCTION public.sync_user_ids(usuario_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Buscar o ID do usuário no auth.users
  SELECT id INTO auth_user_id FROM auth.users WHERE email = usuario_email;
  
  -- Se o usuário existe no auth.users, atualizar o ID na tabela usuarios
  IF auth_user_id IS NOT NULL THEN
    UPDATE public.usuarios
    SET id = auth_user_id, 
        auth_sincronizado = true
    WHERE email = usuario_email;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$function$;
