import { adminSupabase } from './lib/supabaseClient';
import dotenv from 'dotenv';

dotenv.config();

async function debugUsers() {
    console.log('Checking environment variables...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing! Admin client will fail.');
    }

    console.log('Fetching users...');
    const { data: { users }, error } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log(`Fetched ${users.length} users`);
    users.forEach(u => {
        console.log(`ID: ${u.id}, Email: ${u.email}`);
    });
}

debugUsers();
