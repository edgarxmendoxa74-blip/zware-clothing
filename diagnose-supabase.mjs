import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://fatrarduupwyxphkepqc.supabase.co';
const supabaseKey = 'sb_publishable_33NhPhSQhR9qfFIzuFmzeA_6wWGn9nY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    let output = '--- DIAGNOSIS START ---\n';

    const tables = ['categories', 'menu_items', 'variations', 'add_ons', 'site_settings', 'payment_methods'];

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                output += `Table ${table}: ❌ ERROR: ${error.message} (${error.code})\n`;
            } else {
                output += `Table ${table}: ✅ OK (${data ? data.length : 0} rows found)\n`;
            }
        } catch (err) {
            output += `Table ${table}: 💥 CRASH: ${err.message}\n`;
        }
    }

    output += '--- DIAGNOSIS END ---\n';
    fs.writeFileSync('diag_output.txt', output);
    console.log('Diagnosis complete. Results saved to diag_output.txt');
}

diagnose();
