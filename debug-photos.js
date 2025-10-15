// Script para debuggear la subida de fotos
// Ejecutar en la consola del navegador de la aplicación

console.log('🔍 Iniciando debug de subida de fotos...');

// Función para verificar buckets
async function checkBuckets() {
    try {
        // Obtener la instancia de Supabase del contexto global
        const supabase = window.supabase || window.__supabase;
        
        if (!supabase) {
            console.error('❌ No se encontró la instancia de Supabase');
            console.log('💡 Asegúrate de estar en la página de la aplicación');
            return;
        }
        
        console.log('✅ Instancia de Supabase encontrada');
        
        // Listar buckets existentes
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error al listar buckets:', listError);
            return;
        }
        
        console.log('📦 Buckets disponibles:');
        buckets.forEach(bucket => {
            console.log(`  - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
        });
        
        // Verificar si existe work-order-images
        const workOrderImagesBucket = buckets.find(b => b.name === 'work-order-images');
        
        if (workOrderImagesBucket) {
            console.log('✅ Bucket work-order-images existe');
            console.log('📋 Configuración del bucket:', workOrderImagesBucket);
        } else {
            console.log('❌ Bucket work-order-images NO existe');
            console.log('🔧 Creando bucket work-order-images...');
            
            const { data: createData, error: createError } = await supabase.storage.createBucket('work-order-images', {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                fileSizeLimit: 10485760 // 10MB
            });
            
            if (createError) {
                console.error('❌ Error al crear bucket:', createError);
            } else {
                console.log('✅ Bucket work-order-images creado exitosamente:', createData);
            }
        }
        
        // Probar subida de archivo
        console.log('🧪 Probando subida de archivo...');
        
        // Crear un archivo de prueba
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('work-order-images')
            .upload('test/test-file.txt', testFile);
            
        if (uploadError) {
            console.error('❌ Error al subir archivo de prueba:', uploadError);
        } else {
            console.log('✅ Archivo de prueba subido exitosamente:', uploadData);
            
            // Obtener URL pública
            const { data: urlData } = supabase.storage
                .from('work-order-images')
                .getPublicUrl(uploadData.path);
                
            console.log('🔗 URL pública del archivo:', urlData.publicUrl);
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Función para verificar el estado actual de las fotos
function checkCurrentPhotos() {
    console.log('🔍 Verificando estado actual de las fotos...');
    
    // Buscar elementos de fotos en el DOM
    const photoInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    console.log('📷 Inputs de fotos encontrados:', photoInputs.length);
    
    photoInputs.forEach((input, index) => {
        console.log(`  Input ${index + 1}:`, {
            id: input.id,
            files: input.files?.length || 0,
            accept: input.accept
        });
    });
    
    // Buscar previews de fotos
    const photoPreviews = document.querySelectorAll('img[alt*="Foto"]');
    console.log('🖼️ Previews de fotos encontrados:', photoPreviews.length);
    
    photoPreviews.forEach((img, index) => {
        console.log(`  Preview ${index + 1}:`, {
            src: img.src,
            alt: img.alt,
            width: img.width,
            height: img.height
        });
    });
}

// Ejecutar verificaciones
checkBuckets();
checkCurrentPhotos();

console.log('💡 Para probar la subida de fotos:');
console.log('1. Selecciona una foto en una tarea');
console.log('2. Marca la tarea como completada');
console.log('3. Revisa la consola para ver los logs de debug');
