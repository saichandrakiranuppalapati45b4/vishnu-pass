import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase
        .from('movement_logs')
        .select(`
            *,
            guard_gates(name),
            students:student_id (full_name, photo_url)
        `)
        .limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
