import { createClient } from '@supabase/supabase-js';

// Manual env for the script
const supabaseUrl = 'https://fatrarduupwyxphkepqc.supabase.co';
const supabaseKey = 'sb_publishable_33NhPhSQhR9qfFIzuFmzeA_6wWGn9nY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkItems() {
    const { data, error } = await supabase.from('menu_items').select('id, name').limit(10);
    if (error) {
        console.error('Error fetching items:', error);
    } else {
        console.log('EXISTING_ITEMS_JSON:' + JSON.stringify(data));
    }
}

checkItems();
