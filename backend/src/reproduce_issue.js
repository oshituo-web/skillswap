const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function reproduce() {
    console.log('--- Starting Reproduction Script ---');

    // 1. Create a temporary user with a known password
    const tempEmail = `test_${Date.now()}@example.com`;
    const tempPassword = 'password123';

    console.log(`Creating temp user: ${tempEmail}`);
    // Use admin.createUser to auto-confirm
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        email_confirm: true
    });

    if (createError) {
        console.error('Failed to create temp user:', createError);
        return;
    }

    console.log('Temp user created and confirmed');

    // Sign in to get the token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword
    });

    if (signInError) {
        console.error('Failed to sign in:', signInError);
        // Cleanup
        await supabase.auth.admin.deleteUser(userData.user.id);
        return;
    }

    const token = signInData.session.access_token;
    console.log('Got access token');

    // 3. Test Avatar Upload
    console.log('\n--- Testing Avatar Upload ---');
    const boundary = '--------------------------' + Date.now().toString(16);
    const filename = 'test-avatar.png';
    const fileContent = Buffer.from('fake image content');

    const body = `--${boundary}\r\nContent-Disposition: form-data; name="avatar"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`;

    const footer = `\r\n--${boundary}--\r\n`;

    const payload = Buffer.concat([
        Buffer.from(body),
        fileContent,
        Buffer.from(footer)
    ]);

    try {
        const res = await fetch('http://localhost:3000/api/upload/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: payload
        });

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response: ${text}`);
    } catch (e) {
        console.error('Upload request failed:', e);
    }

    // 4. Test Exchanges
    console.log('\n--- Testing Exchanges ---');
    try {
        const res = await fetch('http://localhost:3000/api/exchanges', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response: ${text}`);
    } catch (e) {
        console.error('Exchanges request failed:', e);
    }

    // Cleanup temp user
    console.log('\n--- Cleanup ---');
    if (signInData.user) {
        await supabase.auth.admin.deleteUser(signInData.user.id);
        console.log('Temp user deleted');
    }
}

reproduce();
