import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Hardcoded for reproduction purposes (from checkUser.js)
const supabaseUrl = 'https://hwmbmbxblftpkqikbiff.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bWJtYnhibGZ0cGtxaWtiaWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA0NDgzNSwiZXhwIjoyMDc4NjIwODM1fQ.-SnZJbpqsm39Akdv-bV_IiJwbhjtzD2wkHG52ExFLa4';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function reproduce() {
    console.log('--- Starting Reproduction Script ---');

    // 1. Check if 'avatars' bucket exists
    console.log('\n1. Checking "avatars" bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error('Error listing buckets:', bucketError);
    } else {
        const avatarBucket = buckets.find(b => b.name === 'avatars');
        if (avatarBucket) {
            console.log('SUCCESS: "avatars" bucket found.');
        } else {
            console.error('FAILURE: "avatars" bucket NOT found.');
        }
    }

    // 2. Check if 'exchanges' table exists (by trying to select from it)
    console.log('\n2. Checking "exchanges" table...');
    const { error: tableError } = await supabase.from('exchanges').select('count', { count: 'exact', head: true });

    if (tableError) {
        console.error('FAILURE: Error accessing "exchanges" table:', tableError.message);
    } else {
        console.log('SUCCESS: "exchanges" table accessible.');
    }

    console.log('\n--- End of Script ---');
}

reproduce();
