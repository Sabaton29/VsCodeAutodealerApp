import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase table structure...');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStructure() {
    try {
        // Get sample work order to see its structure
        const { data: workOrders, error: woError } = await supabase
            .from('work_orders')
            .select('*')
            .limit(1);
        
        if (woError) {
            console.error('❌ Error fetching work orders:', woError);
            return;
        }
        
        if (workOrders && workOrders.length > 0) {
            console.log('📋 Work Order columns in Supabase:');
            console.log(Object.keys(workOrders[0]));
            console.log('📋 Sample work order data:');
            console.log(JSON.stringify(workOrders[0], null, 2));
        }
        
        // Get sample quote to see its structure
        const { data: quotes, error: qError } = await supabase
            .from('quotes')
            .select('*')
            .limit(1);
        
        if (qError) {
            console.error('❌ Error fetching quotes:', qError);
            return;
        }
        
        if (quotes && quotes.length > 0) {
            console.log('\n📋 Quote columns in Supabase:');
            console.log(Object.keys(quotes[0]));
            console.log('📋 Sample quote data:');
            console.log(JSON.stringify(quotes[0], null, 2));
        }
        
        // Check if there are separate tables for diagnostic data
        console.log('\n🔍 Checking for diagnostic-related tables...');
        
        // Try to get table list (this might not work with anon key)
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_tables');
        
        if (tablesError) {
            console.log('ℹ️ Cannot list tables with anon key, checking specific tables...');
            
            // Check common diagnostic table names
            const diagnosticTableNames = ['diagnostic_data', 'work_order_diagnostics', 'diagnostics'];
            
            for (const tableName of diagnosticTableNames) {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                
                if (!error && data) {
                    console.log(`✅ Found table: ${tableName}`);
                    console.log(`Columns: ${Object.keys(data[0] || {})}`);
                } else {
                    console.log(`❌ Table ${tableName} not found or error:`, error?.message);
                }
            }
        } else {
            console.log('📋 Available tables:', tables);
        }
        
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

debugStructure();



