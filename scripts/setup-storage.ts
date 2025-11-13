import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage buckets...\n')

  const buckets = [
    {
      id: 'startup-logos',
      name: 'startup-logos',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
    },
    {
      id: 'pitch-decks',
      name: 'pitch-decks',
      public: false, // Private bucket for pitch decks
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf'],
    },
  ]

  for (const bucket of buckets) {
    console.log(`📦 Checking bucket: ${bucket.name}`)

    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error(`❌ Error listing buckets:`, listError.message)
      continue
    }

    const bucketExists = existingBuckets?.some((b) => b.id === bucket.id)

    if (bucketExists) {
      console.log(`✅ Bucket "${bucket.name}" already exists`)

      // Update bucket configuration
      const { error: updateError } = await supabase.storage.updateBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      })

      if (updateError) {
        console.error(`⚠️  Could not update bucket configuration:`, updateError.message)
      } else {
        console.log(`✅ Updated bucket configuration for "${bucket.name}"`)
      }
    } else {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      })

      if (createError) {
        console.error(`❌ Error creating bucket "${bucket.name}":`, createError.message)
      } else {
        console.log(`✅ Created bucket "${bucket.name}"`)
      }
    }

    console.log()
  }

  console.log('✨ Storage setup complete!\n')
  console.log('Bucket configurations:')
  buckets.forEach((bucket) => {
    console.log(`  • ${bucket.name}:`)
    console.log(`    - Public: ${bucket.public}`)
    console.log(`    - Max size: ${(bucket.fileSizeLimit / 1024 / 1024).toFixed(0)}MB`)
    console.log(`    - Allowed types: ${bucket.allowedMimeTypes.join(', ')}`)
  })
}

setupStorage()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
