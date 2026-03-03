import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://fatrarduupwyxphkepqc.supabase.co';
const supabaseKey = 'sb_publishable_33NhPhSQhR9qfFIzuFmzeA_6wWGn9nY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    let output = '--- COLUMN CHECK START ---\n';

    try {
        const { data, error } = await supabase.from('variations').select('*').limit(1);
        if (error) {
            output += `variations table error: ${error.message}\n`;
        } else if (data && data.length > 0) {
            output += `variations table columns: ${Object.keys(data[0]).join(', ')}\n`;
        } else {
            output += `variations table is empty, cannot check columns directly.\n`;
        }
    } catch (err) {
        output += `variations crash: ${err.message}\n`;
    }

    try {
        const { data, error } = await supabase.from('menu_items').select('*').limit(1);
        if (error) {
            output += `menu_items table error: ${error.message}\n`;
        } else if (data && data.length > 0) {
            output += `menu_items table columns: ${Object.keys(data[0]).join(', ')}\n`;
        }
    } catch (err) {
        output += `menu_items crash: ${err.message}\n`;
    }

    output += '--- COLUMN CHECK END ---\n';
    fs.writeFileSync('column_check.txt', output);
    console.log('Column check complete.');
}

diagnose();
