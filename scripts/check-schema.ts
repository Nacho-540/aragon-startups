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

async function checkSchema() {
  console.log('🔍 Checking submissions table schema...\n')

  try {
    // Try to insert a test record to see what errors we get
    const testData = {
      nombre: 'Test',
      slug: `test-${Date.now()}`,
      descripcion_breve: 'Test description breve with enough characters to pass validation',
      descripcion_larga: 'Test description larga with enough characters to pass validation. This needs to be longer than 100 characters to meet the requirements.',
      logo_url: null,
      ano_fundacion: 2024,
      estado: 'active',
      ubicacion: 'Test Location',
      tags: ['SaaS'],
      num_empleados: null,
      web: null,
      email: null,
      phone: null,
      redes_sociales: {},
      inversion_recibida: null,
      pitch_deck_url: null,
      submitter_email: 'test@example.com',
      status: 'pending',
    }

    console.log('📝 Attempting test insert...')
    const { data, error } = await supabase
      .from('submissions')
      .insert(testData)
      .select()
      .single()

    if (error) {
      console.error('❌ Insert error:', error)
      console.log('\nError details:')
      console.log('  Code:', error.code)
      console.log('  Message:', error.message)
      console.log('  Details:', error.details)
      console.log('  Hint:', error.hint)
    } else {
      console.log('✅ Test insert successful!')
      console.log('Data:', data)

      // Clean up test data
      await supabase.from('submissions').delete().eq('id', data.id)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkSchema()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
