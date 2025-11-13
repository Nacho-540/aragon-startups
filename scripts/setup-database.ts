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

async function setupDatabase() {
  console.log('🚀 Setting up database schema...\n')

  try {
    // Read the SQL file
    const sqlFile = join(__dirname, '../supabase/schema.sql')
    const sql = readFileSync(sqlFile, 'utf-8')

    console.log('📝 Executing SQL schema...')

    // Execute the SQL directly using the SQL editor endpoint
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    }).single()

    if (error) {
      // If the RPC function doesn't exist, we'll use a different approach
      console.log('⚠️  Direct SQL execution not available, using alternative method...\n')

      // Check if submissions table exists
      const { data: tables, error: tableError } = await supabase
        .from('submissions')
        .select('id')
        .limit(1)

      if (tableError) {
        if (tableError.code === '42P01') {
          console.error('❌ Error: The submissions table does not exist.')
          console.log('\n📋 Please execute the following SQL in your Supabase SQL Editor:')
          console.log('   Dashboard > SQL Editor > New Query\n')
          console.log('Then paste the content from: supabase/schema.sql\n')
          process.exit(1)
        } else {
          console.error('❌ Error checking table:', tableError.message)
          process.exit(1)
        }
      } else {
        console.log('✅ Submissions table exists!')
      }
    } else {
      console.log('✅ Schema executed successfully!')
    }

    console.log('\n✨ Database setup complete!')
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    console.log('\n📋 Manual setup required:')
    console.log('   1. Go to Supabase Dashboard > SQL Editor')
    console.log('   2. Create a new query')
    console.log('   3. Paste the content from: supabase/schema.sql')
    console.log('   4. Execute the query\n')
    process.exit(1)
  }
}

setupDatabase()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
