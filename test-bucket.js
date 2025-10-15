// Script simple para verificar buckets de Supabase
// Ejecutar en la consola del navegador

console.log('🔍 Verificando buckets de Supabase...');

// Obtener la instancia de Supabase del contexto de la aplicación
// Esto asume que tienes acceso a la instancia de Supabase en el contexto global
if (window.supabase) {
    window.supabase.storage.listBuckets().then(({ data, error }) => {
        if (error) {
            console.error('❌ Error al listar buckets:', error);
        } else {
            console.log('✅ Buckets disponibles:', data);
            
            const workOrderImagesBucket = data.find(b => b.name === 'work-order-images');
            if (workOrderImagesBucket) {
                console.log('✅ Bucket work-order-images existe:', workOrderImagesBucket);
            } else {
                console.log('❌ Bucket work-order-images NO existe');
                console.log('🔧 Creando bucket work-order-images...');
                
                window.supabase.storage.createBucket('work-order-images', {
                    public: true,
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    fileSizeLimit: 10485760 // 10MB
                }).then(({ data: createData, error: createError }) => {
                    if (createError) {
                        console.error('❌ Error al crear bucket:', createError);
                    } else {
                        console.log('✅ Bucket work-order-images creado:', createData);
                    }
                });
            }
        }
    });
} else {
    console.log('❌ No se encontró la instancia de Supabase en window.supabase');
    console.log('💡 Intenta ejecutar esto en la consola de la aplicación donde se carga Supabase');
}
