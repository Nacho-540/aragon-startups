# Configuración de Supabase

## URLs de Redirect que necesitas configurar en Supabase

Para que el reset de password funcione correctamente, necesitas configurar las siguientes URLs en tu proyecto de Supabase:

### Paso 1: Ir a Authentication Settings

1. Abre tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **Authentication** → **URL Configuration**

### Paso 2: Configurar Site URL

```
Site URL: http://localhost:3000
```

### Paso 3: Configurar Redirect URLs

Añade la siguiente URL en **Redirect URLs**:

```
http://localhost:3000/auth/callback
```

**Nota**: El callback handler detectará automáticamente si es un flujo de recuperación de password y redirigirá a `/update-password`.

### Paso 4: Email Templates (Opcional pero recomendado)

Ve a **Authentication** → **Email Templates** y personaliza:

#### Password Reset Email

Asegúrate de que el template incluye el link correcto:

```html
<h2>Reset Password</h2>
<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
```

La variable `{{ .ConfirmationURL }}` automáticamente incluirá el `redirectTo` que configuramos en el código.

### Paso 5: Verificar configuración

Después de guardar los cambios en Supabase:

1. Cierra sesión si estás logueado
2. Ve a `/reset-password`
3. Ingresa tu email
4. Revisa tu correo
5. Haz clic en el enlace
6. Deberías ser redirigido a `/update-password`
7. Ingresa tu nueva contraseña
8. Deberías poder iniciar sesión con la nueva contraseña

## Configuración para Producción

Cuando despliegues a producción, añade también:

```
Site URL: https://tu-dominio.com

Redirect URLs:
https://tu-dominio.com/auth/callback
https://tu-dominio.com/auth/callback?next=/update-password
```

## Troubleshooting

### Error 404 al hacer clic en el enlace del email

**Causa**: La URL de redirect no está configurada en Supabase

**Solución**:
1. Verifica que añadiste `http://localhost:3000/auth/callback` en Redirect URLs
2. Espera 1-2 minutos después de guardar (a veces Supabase tarda en actualizar)
3. Solicita un nuevo email de reset

### El enlace me lleva al dashboard en vez de update-password

**Causa**: El parámetro `next` no se está pasando correctamente

**Solución**: Ya está corregido en el código. Asegúrate de solicitar un nuevo email después de los cambios.

### "Invalid link" o "Link expired"

**Causa**: Los enlaces de reset expiran después de 1 hora

**Solución**: Solicita un nuevo enlace de reset

## Verificación Rápida

Ejecuta este comando para verificar que las variables de entorno están correctas:

```bash
cat .env.local | grep SUPABASE
```

Deberías ver:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
