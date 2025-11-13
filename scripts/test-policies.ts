/**
 * Test RLS Policies Step by Step
 * Run with: npx tsx scripts/test-policies.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local file
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      process.env[key.trim()] = value
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPolicies() {
  console.log('🔍 Testing RLS Policies Step by Step\n')
  console.log('=' .repeat(60))

  // Test 1: Check if RLS is enabled
  console.log('\n📋 STEP 1: Verify RLS is enabled')
  console.log('-'.repeat(60))
  try {
    const { data: rlsCheck, error } = await supabase.rpc('pg_tables_check', {})

    // Alternative: Try a simple query to see what happens
    const { data, error: testError } = await supabase
      .from('startups')
      .select('id')
      .limit(1)

    if (testError) {
      console.log('❌ Error:', testError.message)
      console.log('   Code:', testError.code)
      console.log('   Details:', testError.details)
      console.log('   Hint:', testError.hint)
    } else {
      console.log('✅ Basic query works')
      console.log('   Returned records:', data?.length || 0)
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }

  // Test 2: Try with is_approved filter
  console.log('\n📋 STEP 2: Query with is_approved = true')
  console.log('-'.repeat(60))
  try {
    const { data, error, count } = await supabase
      .from('startups')
      .select('*', { count: 'exact' })
      .eq('is_approved', true)

    if (error) {
      console.log('❌ Error:', error.message)
      console.log('   Code:', error.code)
      console.log('   Details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Query successful')
      console.log('   Total count:', count)
      console.log('   Returned records:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('\n   Sample startup:')
        console.log('   - ID:', data[0].id)
        console.log('   - Name:', data[0].nombre)
        console.log('   - Approved:', data[0].is_approved)
      }
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }

  // Test 3: Check the actual error from getApprovedStartups logic
  console.log('\n📋 STEP 3: Test exact query from getApprovedStartups')
  console.log('-'.repeat(60))
  try {
    let query = supabase
      .from('startups')
      .select('*', { count: 'exact' })
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    const from = 0
    const to = 19
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.log('❌ Error:', error.message)
      console.log('   Code:', error.code)
      console.log('   Full error object:')
      console.log(JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Query successful')
      console.log('   Total count:', count)
      console.log('   Returned records:', data?.length || 0)
    }
  } catch (err: any) {
    console.log('❌ Unexpected error:', err.message || err)
    console.log('   Full error:', JSON.stringify(err, null, 2))
  }

  // Test 4: Check startup_owners table
  console.log('\n📋 STEP 4: Test startup_owners table')
  console.log('-'.repeat(60))
  try {
    const { data, error, count } = await supabase
      .from('startup_owners')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      console.log('❌ Error:', error.message)
      console.log('   Code:', error.code)
    } else {
      console.log('✅ Query successful')
      console.log('   Total count:', count)
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }

  // Test 5: Check submissions table
  console.log('\n📋 STEP 5: Test submissions table')
  console.log('-'.repeat(60))
  try {
    const { data, error, count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      console.log('❌ Error:', error.message)
      console.log('   Code:', error.code)
    } else {
      console.log('✅ Query successful')
      console.log('   Total count:', count)
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🏁 Testing Complete')
  console.log('='.repeat(60))
}

testPolicies()
