import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the backend root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const makeAdmin = async (email: string) => {
    console.log(`Looking for user with email: ${email}`);

    // List users to find the ID (admin.listUsers is paginated, but for dev this is fine)
    // Alternatively we can't search by email directly in all versions, but listUsers works.
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

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address as an argument.');
    console.log('Usage: npx ts-node src/scripts/makeAdmin.ts <email>');
    process.exit(1);
}

makeAdmin(email);
