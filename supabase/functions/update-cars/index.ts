
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Request received for update-cars function');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders })
  }

  // Paso 1: Responder inmediatamente para evitar TimeoutError
  const processPromise = processCars();
  
  // Iniciar el proceso en segundo plano sin esperar su finalización
  try {
    console.log('Starting background task with EdgeRuntime.waitUntil');
    EdgeRuntime.waitUntil(processPromise.catch(err => {
      console.error('Background task failed with error:', err);
      console.error('Error stack:', err.stack);
    }));
  } catch (err) {
    console.error("Error starting background task:", err);
    console.error("Error stack:", err.stack);
  }
  
  // Responder inmediatamente
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Actualización de coches iniciada en segundo plano',
      timestamp: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 202, // Accepted
    }
  );
});

// Función independiente para procesar los coches en segundo plano
async function processCars() {
  console.log('Background task started: processCars()');
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://maoyslknefzzipdmvbex.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb3lzbGtuZWZ6emlwZG12YmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDE3NjAsImV4cCI6MjA1NzM3Nzc2MH0.gnBYnv8cNazTSFV8QEk499NCoDcsVUlmQHomauC1kqM'
    
    console.log('Creating Supabase client');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');
    
    // Optimización: URL de API simplificada con parámetros reducidos para obtener coches más recientes
    const apiUrl = 'https://carfiable.mx/lista/?token=CAF001&year=2022,2023,2024,2025&precio=500000,5000000&limit=30'
    console.log(`Fetching cars from API: ${apiUrl}`);
    
    // Optimización: Fetch con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      console.log('Starting API fetch request');
      const response = await fetch(apiUrl, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      console.log('Parsing JSON response');
      const responseData = await response.json();
      console.log('JSON parsed successfully');
      
      if (!responseData) {
        console.error('No data returned from API');
        return;
      }
      
      // Extract car data array
      let carsData = [];
      
      // Estructura específica confirmada: responseData.cars.data[]
      if (responseData.cars && Array.isArray(responseData.cars.data)) {
        carsData = responseData.cars.data;
        console.log(`Found cars array in cars.data with ${carsData.length} items`);
      } else {
        console.error('Could not find expected cars.data array in response');
        console.log('Response structure:', JSON.stringify(responseData).substring(0, 300) + '...');
        return;
      }
      
      // Debug: Mostrar el primer elemento para verificar estructura
      if (carsData.length > 0) {
        console.log('First car data sample:', JSON.stringify(carsData[0]).substring(0, 500) + '...');
      }
      
      console.log(`Found ${carsData.length} cars in API response`);
      
      // Filtrar los coches que cumplen con los criterios
      console.log('Filtering car data');
      const validCars = carsData
        .filter(car => {
          if (!car || !car.id) {
            return false;
          }
          
          // Criterio flexible para el registro (mexicano de agencia o cualquier mexicano)
          const validRegistro = car.registro === 'Mexicano de agencia' || 
                               (car.registro && car.registro.includes('Mexicano'));
          
          // Verificar año >= 2022
          const validYear = car.year && parseInt(String(car.year), 10) >= 2022;
          
          return validRegistro && validYear;
        })
        .map(car => {
          // Determinar la URL de la imagen (con prioridad)
          let imageUrl = null;
          if (car.imagen) {
            imageUrl = car.imagen;
          } else if (car.exterior && Array.isArray(car.exterior) && car.exterior.length > 0) {
            imageUrl = car.exterior[0];
          } else if (car.cover) {
            imageUrl = car.cover;
          }
          
          // Crear un título si no existe
          const title = car.title || `${car.marca} ${car.modelo} ${car.year}`;
          
          return {
            id: car.id,
            brand: car.marca || '',
            model: car.modelo || '',
            version: car.version || null,
            year: car.year || '',
            price: car.precio || '',
            image_url: imageUrl,
            title: title,
            url: car.url || null,
            registration_type: car.registro || '',
            last_checked: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
      
      console.log(`Filtered to ${validCars.length} valid cars`);
      
      if (validCars.length === 0) {
        console.error('No valid cars found after filtering');
        return;
      }
      
      // Procesar en batches más pequeños (3 coches por batch)
      const BATCH_SIZE = 3;
      const batches = [];
      
      for (let i = 0; i < validCars.length; i += BATCH_SIZE) {
        batches.push(validCars.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`Split cars into ${batches.length} batches of up to ${BATCH_SIZE} each`);
      
      // Procesar batches secuencialmente
      let totalUpserted = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} cars`);
        
        try {
          // Log the exact data being sent for the first batch to debug
          if (i === 0) {
            console.log('First batch data example:', JSON.stringify(batch[0]));
          }
          
          console.log(`Upserting batch ${i+1} to database`);
          const { data, error } = await supabase
            .from('cars')
            .upsert(batch, { onConflict: 'id' });
          
          if (error) {
            console.error(`Error upserting batch ${i+1}:`, error);
          } else {
            totalUpserted += batch.length;
            console.log(`Upserted batch ${i+1} successfully`);
          }
        } catch (err) {
          console.error(`Error processing batch ${i+1}:`, err);
          console.error('Error stack:', err.stack);
        }
        
        // Pausa más larga entre batches (1 segundo)
        if (i < batches.length - 1) {
          console.log('Pausing between batches (1000ms)');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`Background task completed. Total cars upserted: ${totalUpserted}`);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`API fetch error: ${fetchError.message}`);
      console.error('Error stack:', fetchError.stack);
    }
    
  } catch (error) {
    console.error('Error in background task:', error);
    console.error('Error stack:', error.stack);
  }
}

// Manejo de cierre de la función
addEventListener('beforeunload', (ev) => {
  console.log('Function shutting down. Reason:', ev.detail?.reason);
});
