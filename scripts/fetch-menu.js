import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getMenuItems() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, base_price, category, popular, available, stock')
        .order('name');

    if (error) {
        console.error('Error fetching menu items:', error);
        process.exit(1);
    }

    console.log(JSON.stringify(data, null, 2));
}

getMenuItems();
