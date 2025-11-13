-- ================================================================
-- CREAR USUARIO ADMIN EN SUPABASE
-- ================================================================
--
-- Este script convierte un usuario existente en admin
-- O te muestra cómo hacerlo manualmente en Supabase Dashboard
--
-- ================================================================

-- OPCIÓN A: Convertir usuario existente en admin (RECOMENDADO)
-- ================================================================
--
-- 1. Ve a Supabase Dashboard → Authentication → Users
-- 2. Busca tu usuario por email
-- 3. Click en el usuario → pestaña "User Metadata"
-- 4. En "Raw User Meta Data", reemplaza el JSON con:
--
-- {
--   "full_name": "Tu Nombre",
--   "role": "admin",
--   "company": "Aragón Startups Admin"
-- }
--
-- 5. Click "Save"
-- 6. Cierra sesión y vuelve a iniciar sesión
--
-- ================================================================

-- OPCIÓN B: Consulta SQL para cambiar rol (si tienes acceso SQL)
-- ================================================================
--
-- IMPORTANTE: Reemplaza 'tu-email@ejemplo.com' con tu email real
--
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   raw_user_meta_data,
--   '{role}',
--   '"admin"'
-- )
-- WHERE email = 'tu-email@ejemplo.com';
--
-- ================================================================

-- OPCIÓN C: Verificar usuarios y sus roles actuales
-- ================================================================

SELECT
  id,
  email,
  raw_user_meta_data->>'full_name' as nombre,
  raw_user_meta_data->>'role' as rol,
  raw_user_meta_data->>'company' as empresa,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ================================================================
-- NOTAS IMPORTANTES
-- ================================================================
--
-- 1. Después de cambiar el rol a 'admin', DEBES cerrar sesión
--    y volver a iniciar sesión para que el cambio tenga efecto
--
-- 2. El rol se almacena en el JWT token, que se genera al iniciar sesión
--
-- 3. Para verificar que funcionó, después de iniciar sesión puedes:
--    - Ir a http://localhost:3000/admin
--    - O ejecutar esta consulta:
--
--    SELECT auth.jwt();
--
--    Y verificar que en user_metadata aparece "role": "admin"
--
-- ================================================================
