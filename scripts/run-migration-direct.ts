import { createClient } from '@supabase/supabase-js'

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🔧 Adding admin_notes column to submissions table...\n')

  try {
    // Try to execute the migration using a simple query
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE public.submissions
        ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      `,
    })

    if (error) {
      console.log('⚠️  RPC method not available, trying alternative approach...\n')

      // Alternative: Try a dummy update to trigger the schema cache refresh
      // Or just inform the user
      console.log('📋 Please execute this SQL in your Supabase SQL Editor:')
      console.log('   Dashboard > SQL Editor > New Query\n')
      console.log('-- Add admin_notes column')
      console.log('ALTER TABLE public.submissions')
      console.log('ADD COLUMN IF NOT EXISTS admin_notes TEXT;')
      console.log('\nOR use Supabase CLI:')
      console.log('supabase db execute < supabase/add-admin-notes.sql')
    } else {
      console.log('✅ Migration executed successfully!')
    }
  } catch (err) {
    console.error('❌ Error:', err)
    console.log('\n📋 Manual SQL to run in Supabase Dashboard:')
    console.log('\nALTER TABLE public.submissions')
    console.log('ADD COLUMN IF NOT EXISTS admin_notes TEXT;')
  }
}

runMigration()
