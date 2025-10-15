import { createClient } from '@supabase/supabase-js';'
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
'
}...` : 'NOT FOUND');

if (!supabaseUrl || !supabaseKey) {'
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Test basic connection'
        const { data, error } = await supabase.from('clients').select('*').limit(1);
        
        if (error) {'
            console.error('❌ Error connecting to Supabase:', error);
            return;
        }
        
        // Test all tables
        const tables = ['
            'locations', 'work_orders', 'clients', 'vehicles', 'staff_members','
            'services', 'inventory_items', 'suppliers', 'petty_cash_transactions','
            'invoices', 'quotes', 'purchase_orders', 'operating_expenses','
            'financial_accounts', 'app_settings', 'time_clock_entries','
            'loans', 'loan_payments', 'notifications', 'appointments',
        ];
        
        for (const table of tables) {
            try {
                const { data, error, count } = await supabase
                    .from(table)'
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    } else {
                    }
            } catch (err) {
                }
        }
        
    } catch (err) {'
        console.error('❌ Connection failed:', err);
    }
}

testConnection();

'