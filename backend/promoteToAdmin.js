const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hwmbmbxblftpkqikbiff.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bWJtYnhibGZ0cGtxaWtiaWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0NDgzNSwiZXhwIjoyMDc4NjIwODM1fQ.-SnZJbpqsm39Akdv-bV_IiJwbhjtzD2wkHG52ExFLa4';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const makeAdmin = async (userId) => {
    console.log(`Promoting user ${userId} to admin...`);

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { is_admin: true } }
    );

    if (updateError) {
        console.error('Error updating user:', updateError);
    } else {
        console.log(`Success! User is now an admin.`);
        console.log('User metadata:', data.user.user_metadata);
    }
};

// Your user ID from the list
makeAdmin('3f97383f-676a-4a05-aeb3-23258ca97fd5');
