const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function debugExchanges() {
    console.log('Fetching users...');
    const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }
    const userIds = new Set(users.map(u => u.id));
    console.log(`Fetched ${users.length} users`);

    console.log('Fetching exchanges...');
    const { data: exchanges, error: exchangesError } = await adminSupabase.from('exchanges').select('*');
    if (exchangesError) {
        console.error('Error fetching exchanges:', exchangesError);
        return;
    }
    console.log(`Fetched ${exchanges.length} exchanges`);
    if (exchanges.length > 0) {
        console.log('First exchange keys:', Object.keys(exchanges[0]));
        console.log('First exchange object:', JSON.stringify(exchanges[0], null, 2));
    }

    let mismatchCount = 0;
    exchanges.forEach(ex => {
        const reqExists = userIds.has(ex.requester_id);
        const provExists = userIds.has(ex.provider_id);

        if (!reqExists || !provExists) {
            mismatchCount++;
            console.log(`Exchange ID: ${ex.id}`);
            if (!reqExists) console.log(`  - Missing Requester ID: ${ex.requester_id}`);
            if (!provExists) console.log(`  - Missing Provider ID: ${ex.provider_id}`);
        }
    });

    if (mismatchCount === 0) {
        console.log('All exchange user IDs match existing users.');
    } else {
        console.log(`Found ${mismatchCount} exchanges with missing user IDs.`);
    }
}

debugExchanges();
