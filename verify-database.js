#!/usr/bin/env node

/**
 * Database Verification Script
 * Checks if all required tables exist in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const requiredTables = [
  'users',
  'accounts',
  'bank_accounts',
  'transactions',
  'ledger_entries'
];

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return { exists: false, error: 'Table does not exist' };
      }
      return { exists: false, error: error.message };
    }
    
    return { exists: true, rowCount: data?.length || 0 };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase Database Setup...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);
  
  let allTablesExist = true;
  const results = {};
  
  for (const table of requiredTables) {
    process.stdout.write(`Checking ${table}... `);
    const result = await checkTable(table);
    results[table] = result;
    
    if (result.exists) {
      console.log('✅ EXISTS');
    } else {
      console.log(`❌ MISSING (${result.error})`);
      allTablesExist = false;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allTablesExist) {
    console.log('✅ All required tables exist!');
    console.log('\n📊 Database is ready to use.');
    
    // Check if there are any users
    const { data: users } = await supabase.from('users').select('*').limit(5);
    if (users && users.length > 0) {
      console.log(`\n👥 Found ${users.length} user(s) in database:`);
      users.forEach(user => {
        console.log(`   - ${user.username || 'No username'} (${user.email || 'No email'})`);
      });
    } else {
      console.log('\n⚠️  No users found in database. You can create one by logging in.');
    }
  } else {
    console.log('❌ Some tables are missing!');
    console.log('\n📝 To set up the database:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the SQL script from: sql/supabase-schema.sql');
    console.log('\n   Or run: npm run setup-db (if configured)');
  }
  
  console.log('='.repeat(60) + '\n');
  
  return allTablesExist;
}

// Run verification
verifyDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
