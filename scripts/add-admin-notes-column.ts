import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

async function addAdminNotesColumn() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔧 Adding admin_notes column to submissions table...\n')

  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'add-admin-notes.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If the RPC function doesn't exist, try direct query
      const { error: directError } = await supabase
        .from('submissions')
        .select('admin_notes')
        .limit(1)

      if (directError && directError.code === 'PGRST204') {
        // Column doesn't exist, need to add it via SQL editor
        console.log('❌ Column does not exist and cannot be added automatically')
        console.log('\n📋 Please run this SQL in Supabase SQL Editor:\n')
        console.log(sql)
        console.log('\nOr use the Supabase CLI:')
        console.log('supabase db execute < supabase/add-admin-notes.sql')
        process.exit(1)
      } else {
        console.log('✅ Column admin_notes already exists or was added successfully!')
      }
    } else {
      console.log('✅ Column added successfully!')
    }

    // Verify the column exists
    const { data, error: verifyError } = await supabase
      .from('submissions')
      .select('admin_notes')
      .limit(1)

    if (verifyError) {
      console.log('\n⚠️  Could not verify column (may still need manual addition):')
      console.log(verifyError.message)
      console.log('\n📋 Please run this SQL in Supabase SQL Editor:\n')
      console.log(sql)
    } else {
      console.log('\n✅ Verification successful - admin_notes column is available!')
    }
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}

addAdminNotesColumn()
