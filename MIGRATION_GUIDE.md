# Migración: Agregar columna admin_notes

## ⚠️ Problema
Al aprobar/rechazar submissions, aparece el error:
```
Could not find the 'admin_notes' column of 'submissions' in the schema cache
```

## ✅ Solución

### Opción 1: Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase Dashboard: https://supabase.com/dashboard
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega este SQL:

```sql
-- Add admin_notes column to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.submissions.admin_notes IS 'Notes added by administrators when reviewing submissions';
```

5. Haz clic en **Run** o presiona `Cmd/Ctrl + Enter`
6. Deberías ver el mensaje: **Success. No rows returned**

### Opción 2: Supabase CLI

Si tienes Supabase CLI instalado:

```bash
cd aragon-startups
supabase db execute < supabase/add-admin-notes.sql
```

### Opción 3: Script Node (Alternativa)

```bash
cd aragon-startups
./scripts/run-migration.sh
```

## 🔍 Verificar la migración

Para verificar que la columna se agregó correctamente, ejecuta en SQL Editor:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'submissions'
  AND column_name = 'admin_notes';
```

Deberías ver:
```
column_name  | data_type | is_nullable
-------------|-----------|-------------
admin_notes  | text      | YES
```

## 📝 ¿Qué hace esta columna?

La columna `admin_notes` permite a los administradores agregar notas cuando:
- ✅ Aprueban una submission
- ❌ Rechazan una submission

Estas notas se guardan para:
- Documentar decisiones
- Proporcionar feedback al submitter
- Mantener un historial de revisión

## 🧪 Probar después de la migración

1. Ve a `/admin/submissions`
2. Selecciona una submission pendiente
3. Intenta aprobar o rechazar con notas
4. Verifica que no aparezca el error `PGRST204`
