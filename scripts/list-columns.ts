import { createClient } from '@supabase/supabase-js'

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

async function listColumns() {
  console.log('🔍 Listing submissions table columns...\n')

  try {
    // Try to select from an empty result to get column info
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error:', error)
    } else {
      if (data && data.length > 0) {
        console.log('📋 Available columns:')
        Object.keys(data[0]).forEach(column => {
          console.log(`  - ${column}`)
        })
      } else {
        console.log('⚠️  No data in table, trying to infer from error...')

        // Try inserting with wrong data to see error
        const { error: insertError } = await supabase
          .from('submissions')
          .insert({ test: 'test' })

        console.log('\nError message:', insertError?.message)
        console.log('Error details:', insertError?.details)
        console.log('Error hint:', insertError?.hint)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

listColumns()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
