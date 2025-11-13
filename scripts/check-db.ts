/**
 * Database Diagnostic Script
 * Run with: npx tsx scripts/check-db.ts
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
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Connection...\n')

  // 1. Check connection
  console.log('1️⃣ Testing connection...')
  try {
    const { data, error } = await supabase.from('startups').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('❌ Connection error:', error.message)
      console.error('   Code:', error.code)
      console.error('   Details:', error.details)
      console.error('   Hint:', error.hint)
    } else {
      console.log('✅ Connection successful')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  // 2. Check startups table
  console.log('\n2️⃣ Checking startups table...')
  try {
    const { data, error, count } = await supabase
      .from('startups')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      console.error('❌ Error querying startups:', error.message)
      console.error('   This usually means RLS policies are missing or incorrect')
      console.error('   Run the SQL file: supabase/rls-policies.sql in Supabase Dashboard')
    } else {
      console.log(`✅ Startups table accessible`)
      console.log(`   Total records: ${count || 0}`)
      console.log(`   Sample records: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log('\n   Sample startup:')
        console.log(`   - ID: ${data[0].id}`)
        console.log(`   - Name: ${data[0].nombre}`)
        console.log(`   - Approved: ${data[0].is_approved}`)
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  // 3. Check approved startups
  console.log('\n3️⃣ Checking approved startups...')
  try {
    const { data, error, count } = await supabase
      .from('startups')
      .select('*', { count: 'exact' })
      .eq('is_approved', true)
      .limit(5)

    if (error) {
      console.error('❌ Error querying approved startups:', error.message)
    } else {
      console.log(`✅ Approved startups query successful`)
      console.log(`   Approved startups: ${count || 0}`)
      if (data && data.length > 0) {
        console.log('\n   Approved startup names:')
        data.forEach((s: any) => console.log(`   - ${s.nombre}`))
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  // 4. Check startup_owners table
  console.log('\n4️⃣ Checking startup_owners table...')
  try {
    const { data, error, count } = await supabase
      .from('startup_owners')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      console.error('❌ Error querying startup_owners:', error.message)
      console.error('   This table needs RLS policies too')
    } else {
      console.log(`✅ Startup_owners table accessible`)
      console.log(`   Total records: ${count || 0}`)
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  // 5. Check submissions table
  console.log('\n5️⃣ Checking submissions table...')
  try {
    const { count, error } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Error querying submissions:', error.message)
    } else {
      console.log(`✅ Submissions table accessible`)
      console.log(`   Total submissions: ${count || 0}`)
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Diagnostic Complete')
  console.log('='.repeat(60))
  console.log('\n💡 Next Steps:')
  console.log('   1. If RLS errors appear, run: supabase/rls-policies.sql')
  console.log('   2. If tables are empty, add test data via Supabase Dashboard')
  console.log('   3. Check .env.local has correct SUPABASE credentials\n')
}

checkDatabase()
