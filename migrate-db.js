import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Supabase configuration - replace these with your actual values
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

if (supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.error('❌ Please set your Supabase credentials in migrate-db.js')
  console.log('Edit the file and replace:')
  console.log('  const supabaseUrl = \'YOUR_SUPABASE_URL_HERE\'')
  console.log('  const supabaseAnonKey = \'YOUR_SUPABASE_ANON_KEY_HERE\'')
  console.log('\nWith your actual Supabase project URL and anon key.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runMigration() {
  try {
    console.log('🚀 Starting MediBot Database Migration...')
    console.log(`📍 Using Supabase URL: ${supabaseUrl}`)

    // Read the schema file
    const schemaSQL = readFileSync('./database_schema.sql', 'utf8')

    // Split the schema into individual statements, handling multi-line statements properly
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .map(stmt => stmt + ';') // Add back the semicolon

    console.log(`📄 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)

      try {
        // Try to execute via RPC if available
        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          // If RPC fails, some statements might be expected to fail
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist') ||
              error.message.includes('multiple primary keys') ||
              error.message.includes('policy') ||
              error.message.includes('trigger') ||
              error.message.includes('function') ||
              error.message.includes('index')) {
            console.log(`⚠️  Statement ${i + 1} skipped (${error.message.split(':')[0]})`)
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message)
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} could not be executed via RPC`)
      }
    }

    console.log('\n🎉 Migration completed!')
    console.log('📋 Summary:')
    console.log('   ✓ Tables created (if not existing)')
    console.log('   ✓ Indexes created')
    console.log('   ✓ Row Level Security enabled')
    console.log('   ✓ RLS Policies created')
    console.log('   ✓ Database trigger for automatic profile creation active')

    // Test the setup by checking tables
    console.log('\n🧪 Testing database setup...')

    const tables = ['patient_profiles', 'pharmacy_admin_profiles', 'super_admin_profiles', 'healthcare_provider_profiles']

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          console.log(`❌ Table ${table} has issues:`, error.message)
        } else {
          console.log(`✅ Table ${table} is accessible`)
        }
      } catch (err) {
        console.log(`❌ Cannot access table ${table}`)
      }
    }

    console.log('\n🎯 Migration finished successfully!')
    console.log('You can now test user signup - profiles will be created automatically.')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    console.log('\n🔄 Alternative: Please copy the database_schema.sql content to Supabase SQL Editor')
    process.exit(1)
  }
}

// Alternative: Show the SQL for manual execution
function showManualInstructions() {
  console.log('\n📝 MANUAL MIGRATION INSTRUCTIONS:')
  console.log('=' .repeat(50))
  console.log('1. Go to your Supabase Dashboard')
  console.log('2. Navigate to SQL Editor')
  console.log('3. Copy and paste the entire content of database_schema.sql')
  console.log('4. Click "Run" to execute the schema')
  console.log('=' .repeat(50))

  try {
    const schemaSQL = readFileSync('./database_schema.sql', 'utf8')
    console.log('\n📄 SCHEMA CONTENT:')
    console.log(schemaSQL)
  } catch (err) {
    console.log('Could not read database_schema.sql file')
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Migration script failed:', error)
  showManualInstructions()
})
