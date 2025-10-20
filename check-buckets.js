import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'your-anon-key'; // Reemplaza con tu key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
    try {
        console.debug('🔍 Verificando buckets disponibles...');
        
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.error('❌ Error al listar buckets:', error);
            return;
        }
        
        console.debug('✅ Buckets disponibles:');
        buckets.forEach(bucket => {
            console.debug(`- ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
        });
        
        // Verificar si existe el bucket work-order-images
        const workOrderImagesBucket = buckets.find(b => b.name === 'work-order-images');
        if (workOrderImagesBucket) {
            console.debug('✅ Bucket work-order-images existe');
        } else {
            console.debug('❌ Bucket work-order-images NO existe');
            console.debug('🔧 Creando bucket work-order-images...');
            
            const { data, error: createError } = await supabase.storage.createBucket('work-order-images', {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                fileSizeLimit: 10485760, // 10MB
            });
            
            if (createError) {
                console.error('❌ Error al crear bucket:', createError);
            } else {
                console.debug('✅ Bucket work-order-images creado exitosamente');
            }
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

checkBuckets();
