require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey || supabaseKey.includes('GANTI_DENGAN')) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('--- MENGUJI KONEKSI SUPABASE ---');
  console.log('URL:', supabaseUrl);
  
  const { data, error } = await supabase.from('tenants').select('count');
  
  if (error) {
    console.error('❌ KONEKSI GAGAL:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('👉 Pastikan ANON_KEY Anda benar.');
    }
  } else {
    console.log('✅ KONEKSI BERHASIL! Supabase merespon dengan baik.');
  }
}

testConnection();
