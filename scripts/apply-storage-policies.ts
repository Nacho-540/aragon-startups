import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyStoragePolicies() {
  console.log('🚀 Applying storage policies...\n')

  try {
    const sqlFile = join(__dirname, '../supabase/storage-policies.sql')
    const sql = readFileSync(sqlFile, 'utf-8')

    // Split SQL by statement and execute each one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`📝 Executing: ${statement.substring(0, 60)}...`)

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

      if (error) {
        console.error(`❌ Error: ${error.message}`)
      } else {
        console.log(`✅ Success`)
      }
    }

    console.log('\n✨ Storage policies applied successfully!')
  } catch (error) {
    console.error('❌ Error applying policies:', error)
    process.exit(1)
  }
}

applyStoragePolicies()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
