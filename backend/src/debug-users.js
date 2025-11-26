const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function debugUsers() {
    console.log('Fetching users...');
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    const users = data.users;
    console.log(`Fetched ${users.length} users`);
    users.forEach(u => {
        console.log(`ID: ${u.id}, Email: ${u.email}`);
    });
}

debugUsers();
