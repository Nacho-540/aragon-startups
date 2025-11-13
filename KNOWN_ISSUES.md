# Known Issues

## Password Reset Flow - Pending Fix

### Issue Description
El flujo de recuperación de contraseña no completa correctamente. El enlace de reset recibido por email redirige a `/login?error=auth` en lugar de a `/update-password`.

### Current Status
- ✅ Email de reset se envía correctamente
- ✅ Usuario recibe el enlace en su correo
- ❌ El enlace no procesa correctamente el token de recuperación
- ❌ No redirige a la página de actualización de contraseña

### Technical Details

**Enlace recibido:**
```
https://hkamkmqvbaqgglcfkbia.supabase.co/auth/v1/verify?token=pkce_...&type=recovery&redirect_to=http://localhost:3000/auth/callback
```

**Comportamiento esperado:**
1. Usuario hace clic en el enlace
2. Supabase procesa el token
3. Redirige a `/auth/callback` con un `code`
4. Callback procesa el code y redirige a `/update-password`

**Comportamiento actual:**
1. Usuario hace clic en el enlace
2. Supabase redirige a `/auth/callback`
3. Callback no recibe los parámetros esperados
4. Redirige a `/login?error=auth`

### Possible Causes
1. **PKCE Flow Configuration**: Supabase puede estar usando un flujo PKCE diferente al esperado
2. **Redirect URL Configuration**: Posible problema con la configuración de redirect URLs en Supabase
3. **Token Processing**: El token PKCE (`pkce_...`) no se está procesando correctamente

### Configuration Checked
- ✅ Site URL configurada: `http://localhost:3000`
- ✅ Redirect URL configurada: `http://localhost:3000/auth/callback`
- ✅ Callback handler actualizado para manejar múltiples flujos
- ✅ Environment variables correctas

### Attempted Solutions
1. **Callback handler mejorado** para detectar:
   - `token_hash` + `type=recovery` (verificación directa con OTP)
   - `code` + `type=recovery` (flujo PKCE con tipo recovery)
   - `code` solo (flujo PKCE estándar)

2. **Configuración simplificada** en Supabase (una sola redirect URL)

3. **Logs de depuración** para identificar qué parámetros llegan al callback

### Next Steps to Fix
1. **Debug Mode**: Añadir logs detallados en el callback para ver exactamente qué parámetros llega
2. **Supabase Support**: Consultar documentación oficial sobre el flujo de password reset
3. **Alternative Approach**: Considerar usar un enfoque diferente para password reset:
   - Magic link con autenticación automática
   - Redirect directo a página de reset sin callback intermedio
   - Custom email template en Supabase

### Workaround
Por ahora, los usuarios pueden:
1. Usar "Olvidé mi contraseña" para recibir el email
2. **Workaround temporal**: Como admin, resetear la contraseña del usuario directamente desde Supabase Dashboard

### Priority
**Medium** - La funcionalidad de login y registro funciona perfectamente. Este es un caso edge que afecta solo cuando un usuario necesita resetear su contraseña.

### Related Files
- `app/auth/callback/route.ts` - Callback handler
- `lib/auth/auth-helpers.ts` - Reset password function
- `app/(auth)/reset-password/page.tsx` - Reset request page
- `app/(auth)/update-password/page.tsx` - Password update page

### Testing Checklist When Fixed
- [ ] Solicitar reset de password
- [ ] Recibir email
- [ ] Hacer clic en el enlace del email
- [ ] Verificar redirección a `/update-password`
- [ ] Ingresar nueva contraseña
- [ ] Verificar redirección a dashboard
- [ ] Iniciar sesión con nueva contraseña

---

## Database Schema Not Created - Requires Manual Setup

### Issue Description
Al enviar el formulario de creación de startups (`/submit`), aparece el error "Error al guardar la solicitud" en el último paso.

### Current Status
- ✅ Paso 1-4 del formulario funcionan correctamente
- ✅ Upload del logo funciona correctamente
- ✅ Validaciones de todos los campos funcionan correctamente
- ❌ Error al guardar en la base de datos

### Technical Details

**Error Code:**
```
PGRST204 - Could not find the 'ano_fundacion' column of 'submissions' in the schema cache
```

**Root Cause:**
La tabla `submissions` en Supabase no existe o tiene un esquema incorrecto. Falta la columna `ano_fundacion` y probablemente otras columnas necesarias.

**Expected Behavior:**
1. Usuario completa los 5 pasos del formulario
2. Logo se sube a Supabase Storage
3. Datos se guardan en la tabla `submissions` con status 'pending'
4. Usuario recibe confirmación de envío exitoso

**Current Behavior:**
1. Usuario completa los 5 pasos ✅
2. Logo se sube correctamente ✅
3. **Error al intentar guardar en la tabla `submissions`** ❌
4. Mensaje de error: "Error al guardar la solicitud"

### Solution Required

**Manual SQL Execution Required:**

1. Ir a: https://supabase.com/dashboard/project/hkamkmqvbaqgglcfkbia
2. Navegar a: **SQL Editor** → **New Query**
3. Copiar el contenido completo de: `supabase/schema.sql`
4. Ejecutar el SQL

**¿Qué hace el SQL?**
- Crea la tabla `submissions` con todas las columnas necesarias
- Configura índices para rendimiento
- Habilita Row Level Security (RLS)
- Crea políticas para permitir:
  - Usuarios anónimos pueden insertar submissions
  - Solo admins pueden ver y actualizar submissions
- Crea trigger para actualizar `updated_at` automáticamente

### Important Note: Column Name
La columna se llama `ano_fundacion` (sin ñ) en la base de datos para evitar problemas con caracteres especiales en PostgreSQL. El frontend envía `año_fundacion` y el backend hace el mapeo automáticamente.

### Related Files
- `supabase/schema.sql` - Schema SQL completo para ejecutar
- `app/api/submissions/route.ts` - API que maneja el envío (línea 16: mapeo año→ano)
- `app/(public)/submit/page.tsx` - Formulario de envío público
- `SETUP_DATABASE.md` - Instrucciones detalladas de configuración

### Priority
**High** - Bloquea completamente el flujo de envío de startups por usuarios

### Workaround
Ninguno. Requiere ejecución manual del SQL en Supabase Dashboard.

---

## Social Media URL Validation - Requires Full URL with Protocol

### Issue Description
Los campos de redes sociales en el formulario de submit fallan la validación si no se incluye la URL completa con `https://`.

### Current Status
- ❌ No acepta URLs parciales como `linkedin.com/company/example`
- ✅ Acepta URLs completas como `https://linkedin.com/company/example`

### Technical Details

**Validation Schema:**
```typescript
// lib/validations/submission.ts (líneas 63-88)
redes_sociales: z.object({
  linkedin: z.string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      { message: 'URL de LinkedIn inválida' }
    ),
  // Similar para twitter, facebook, instagram
})
```

**Examples:**
- ❌ Falla: `linkedin.com/company/example`
- ❌ Falla: `twitter.com/example`
- ❌ Falla: `www.linkedin.com/company/example`
- ✅ Funciona: `https://linkedin.com/company/example`
- ✅ Funciona: `https://twitter.com/example`

### Expected Behavior
Los usuarios deberían poder ingresar URLs parciales (sin protocolo) y el sistema debería:
1. Aceptar la URL parcial
2. Automáticamente agregar `https://` si falta
3. Validar que la URL resultante sea válida

### Current Behavior
El sistema requiere que los usuarios ingresen URLs completas con protocolo, causando confusión y errores de validación.

### Impact
- **Severity:** Medium
- **User Experience:** Afecta la experiencia del usuario
- Los campos son opcionales, por lo que los usuarios pueden saltárselos
- Puede causar frustración si no entienden el error

### Workaround
Instruir a los usuarios a siempre incluir `https://` al inicio de las URLs de redes sociales.

### Suggested Fix
Modificar la validación para transformar URLs parciales:

```typescript
.transform((val) => {
  if (!val || val === '') return val;
  // Si no empieza con http:// o https://, agregar https://
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    return `https://${val}`;
  }
  return val;
})
.refine(
  (val) => !val || val === '' || z.string().url().safeParse(val).success,
  { message: 'URL de LinkedIn inválida' }
)
```

### Priority
**Low-Medium** - Mejora de UX, no bloquea funcionalidad crítica

### Related Files
- `lib/validations/submission.ts` - Schema de validación (líneas 63-88)
- `app/(public)/submit/page.tsx` - Formulario que usa la validación

---

**Last Updated**: 2025-11-11
**Discovered By**: Testing Phase 3
**Assigned To**: Pending
