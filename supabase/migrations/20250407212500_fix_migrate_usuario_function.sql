
-- Modificar a função migrate_usuario_to_auth para garantir que providers esteja configurado corretamente
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
  ELSE
    -- Se o usuário já existe, atualizar o campo providers para garantir que "email" esteja incluído
    UPDATE auth.users
    SET raw_app_meta_data = 
      CASE 
        WHEN raw_app_meta_data->>'providers' IS NULL THEN
          jsonb_set(raw_app_meta_data, '{providers}', '["email"]')
        ELSE
          CASE 
            WHEN raw_app_meta_data->'providers' ? 'email' THEN raw_app_meta_data
            ELSE jsonb_set(
                 raw_app_meta_data, 
                 '{providers}', 
                 (raw_app_meta_data->'providers') || '["email"]'::jsonb
               )
          END
      END,
      raw_app_meta_data = jsonb_set(raw_app_meta_data, '{provider}', '"email"'),
      encrypted_password = CASE 
        WHEN usuario_senha IS NOT NULL THEN crypt(usuario_senha, gen_salt('bf'))
        ELSE encrypted_password
      END
    WHERE id = v_user_id;
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
