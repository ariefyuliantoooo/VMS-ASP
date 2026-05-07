require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('⏳ Mencoba mendaftarkan user admin@gmail.com...');
  
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@gmail.com',
    password: 'admin123',
    options: {
      data: {
        full_name: 'Administrator',
        role: 'superadmin'
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('ℹ️ User sudah terdaftar. Silakan langsung login dengan password admin123.');
    } else {
      console.error('❌ GAGAL:', error.message);
      console.log('Saran: Jika error "Email confirmation is enabled", Anda harus mengonfirmasi user secara manual di Dashboard Supabase > Authentication.');
    }
  } else {
    console.log('✅ BERHASIL! User admin@gmail.com telah dibuat.');
    console.log('👉 Silakan coba login di browser sekarang dengan password: admin123');
  }
}

createAdmin();
