const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hwmbmbxblftpkqikbiff.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bWJtYnhibGZ0cGtxaWtiaWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0NDgzNSwiZXhwIjoyMDc4NjIwODM1fQ.-SnZJbpqsm39Akdv-bV_IiJwbhjtzD2wkHG52ExFLa4';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const checkUser = async (email) => {
    console.log(`\nChecking user: ${email}\n`);

    // Get user by email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found');
        return;
    }

    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('User Metadata:', JSON.stringify(user.user_metadata, null, 2));
    console.log('App Metadata:', JSON.stringify(user.app_metadata, null, 2));
    console.log('\nIs Admin?', user.user_metadata?.is_admin);
};

checkUser('oshituo@gmail.com');
