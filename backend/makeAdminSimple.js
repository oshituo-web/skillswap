const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hwmbmbxblftpkqikbiff.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bWJtYnhibGZ0cGtxaWtiaWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0NDgzNSwiZXhwIjoyMDc4NjIwODM1fQ.-SnZJbpqsm39Akdv-bV_IiJwbhjtzD2wkHG52ExFLa4';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const makeAdmin = async (email) => {
    console.log(`Looking for user with email: ${email}`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user: ${user.id}. Updating metadata...`);

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, is_admin: true } }
    );

    if (updateError) {
        console.error('Error updating user:', updateError);
    } else {
        console.log(`Success! User ${email} is now an admin.`);
    }
};

const email = process.argv[2] || 'oshituo@gmail.com';
makeAdmin(email);
