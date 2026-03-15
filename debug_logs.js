import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase.from('movement_logs').select('*').limit(5);
    console.log('Logs:', data);
    console.log('Error:', error);
    
    const { data: joined, error: joinedError } = await supabase
        .from('movement_logs')
        .select('*, guard_gates(name)')
        .limit(5);
    console.log('Joined Logs:', joined);
    console.log('Joined Error:', joinedError);
}

test();
