import { createClient } from '@supabase/supabase-js';'
import { readFileSync } from 'fs';

// Read .env file manually'
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
'
envContent.split('\n').forEach(line => {'
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
'
}...` : 'NOT FOUND');

if (!supabaseUrl || !supabaseKey) {'
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Test basic connection with clients table'
        const { data, error } = await supabase.from('clients').select('*').limit(5);
        
        if (error) {'
            console.error('❌ Error connecting to clients table:', error);
        } else {
            if (data.length > 0) {
                }
        }
        
        // Test other key tables'
        const keyTables = ['work_orders', 'vehicles', 'staff_members', 'inventory_items'];
        
        for (const table of keyTables) {
            const { data, error, count } = await supabase
                .from(table)'
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                } else {
                }
        }
        
    } catch (err) {'
        console.error('❌ Connection failed:', err);
    }
}

testConnection();

'