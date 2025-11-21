const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hwmbmbxblftpkqikbiff.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bWJtYnhibGZ0cGtxaWtiaWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0NDgzNSwiZXhwIjoyMDc4NjIwODM1fQ.-SnZJbpqsm39Akdv-bV_IiJwbhjtzD2wkHG52ExFLa4';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const listUsers = async () => {
    console.log('Fetching all users...');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    console.log(`\nFound ${users.length} users:\n`);
    users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Is Admin: ${user.user_metadata?.is_admin || false}`);
        console.log('');
    });
};

listUsers();
