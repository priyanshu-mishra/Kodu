#!/usr/bin/env node

/**
 * Initialize EUR Accounts for Existing Users
 * Creates EUR accounts with initial balance for testing
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeEurAccounts() {
  console.log('🚀 Initializing EUR Accounts for Users...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email');

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log(`Found ${users.length} user(s)\n`);

    let created = 0;
    let existing = 0;

    for (const user of users) {
      // Check if user already has EUR account
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('account_type', 'USER_EUR')
        .single();

      if (existingAccount) {
        console.log(`✓ ${user.username || user.email} - Already has EUR account`);
        existing++;
        continue;
      }

      // Create EUR account with initial balance
      const { error: createError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          account_type: 'USER_EUR',
          currency: 'EUR',
          balance: 100.00,  // Initial balance for testing
          available_balance: 100.00
        });

      if (createError) {
        console.error(`✗ ${user.username || user.email} - Failed: ${createError.message}`);
      } else {
        console.log(`✓ ${user.username || user.email} - Created with €100.00`);
        created++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Initialization Complete!`);
    console.log(`   Created: ${created} new EUR account(s)`);
    console.log(`   Existing: ${existing} EUR account(s)`);
    console.log('='.repeat(60) + '\n');

    // Show summary
    const { data: accounts } = await supabase
      .from('accounts')
      .select(`
        id,
        balance,
        available_balance,
        users:user_id (username, email)
      `)
      .eq('account_type', 'USER_EUR');

    if (accounts && accounts.length > 0) {
      console.log('📊 EUR Account Summary:\n');
      accounts.forEach(acc => {
        const user = acc.users;
        console.log(`  ${user.username || user.email}`);
        console.log(`    Balance: €${parseFloat(acc.balance).toFixed(2)}`);
        console.log(`    Available: €${parseFloat(acc.available_balance).toFixed(2)}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run initialization
initializeEurAccounts()
  .then(() => {
    console.log('✨ Done! Users can now send EUR payments.\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  });
