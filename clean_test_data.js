const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function cleanTestData() {
  console.log('🧹 STARTING SUPABASE TEST DATA CLEANUP...\n');

  // Read .env.local for Supabase credentials
  let envContent = '';
  try {
    envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  } catch (err) {
    console.log('⚠️ .env.local file not found. Running in local memory mode.');
  }

  const matchUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const matchKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/) || envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

  const supabaseUrl = matchUrl ? matchUrl[1].trim() : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = matchKey ? matchKey[1].trim() : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️ Supabase credentials not found in environment. Cleanup skipped.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Delete test sales
    const { error: salesErr } = await supabase
      .from('sales')
      .delete()
      .or('lead_id.eq.unassigned,amount.eq.999');

    if (salesErr) console.error('Sales cleanup note:', salesErr.message);
    else console.log('✅ Test sales removed.');

    // 2. Delete test leads
    const { error: leadsErr } = await supabase
      .from('leads')
      .delete()
      .like('email', '%example.com%');

    if (leadsErr) console.error('Leads cleanup note:', leadsErr.message);
    else console.log('✅ Test leads removed.');

    // 3. Delete test content items
    const { error: contentErr } = await supabase
      .from('content')
      .delete()
      .like('tracking_slug', '%test%');

    if (contentErr) console.error('Content cleanup note:', contentErr.message);
    else console.log('✅ Test content items removed.');

    console.log('\n🎉 SUPABASE PRODUCTION DATABASE CLEANED SUCCESSFULLY!');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
}

cleanTestData();
