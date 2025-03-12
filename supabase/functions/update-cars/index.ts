
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Optimización: Reducir el modelo de datos
interface CarData {
  id: string
  marca: string
  modelo: string
  version: string | null
  year: string
  precio: string
  imagen: string | null
  title: string
  url: string | null
  registro: string
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
    
    // Optimización: URL de API simplificada con parámetros reducidos
    const apiUrl = 'https://carfiable.mx/lista/?token=CAF001&year=2023,2024,2025&precio=500000,5000000&limit=50'
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
      
      // Analizar estructura correcta basada en los logs
      console.log('Response is an object, looking for data structure');
      console.log('Object keys:', Object.keys(responseData));
      
      // Estructura esperada según logs: responseData.cars.data[]
      if (responseData.cars && Array.isArray(responseData.cars.data)) {
        carsData = responseData.cars.data;
        console.log(`Found cars array in cars.data with ${carsData.length} items`);
      } else if (responseData.cars && Array.isArray(responseData.cars)) {
        carsData = responseData.cars;
        console.log(`Found cars array directly in 'cars' property with ${carsData.length} items`);
      } else {
        // Intentar buscar cualquier array en la respuesta
        for (const key in responseData) {
          if (Array.isArray(responseData[key])) {
            carsData = responseData[key];
            console.log(`Found array in property '${key}' with ${carsData.length} items`);
            break;
          } else if (responseData[key] && typeof responseData[key] === 'object' && responseData[key].data && Array.isArray(responseData[key].data)) {
            carsData = responseData[key].data;
            console.log(`Found array in property '${key}.data' with ${carsData.length} items`);
            break;
          }
        }
      }
      
      // Mostrar una muestra de la estructura de datos para debug
      console.log('Response data structure:', JSON.stringify(responseData).substring(0, 500) + '...');
      
      if (carsData.length === 0) {
        console.error('Could not find car data in API response');
        if (responseData.cars && typeof responseData.cars === 'object') {
          console.log('Cars object structure:', JSON.stringify(responseData.cars).substring(0, 500) + '...');
        }
        return;
      }
      
      console.log(`Found ${carsData.length} cars in API response`);
      
      // Optimización: Filtrado más eficiente y batch más pequeño
      console.log('Filtering car data');
      const validCars = carsData
        .filter(car => {
          if (!car || !car.id) {
            return false;
          }
          // Log the first car to debug
          if (carsData.indexOf(car) === 0) {
            console.log('First car sample:', JSON.stringify(car));
          }
          
          // Adaptado para ser más flexible con el campo registro
          return (car.registro === 'Mexicano de agencia' || car.registro?.includes('Mexicano')) && 
                 car.year && 
                 parseInt(String(car.year), 10) >= 2022;
        })
        .slice(0, 30) // Limitamos a max 30 coches para procesamiento más rápido
        .map(car => {
          // Determinar la URL de la imagen
          let imageUrl = null;
          if (car.imagen) {
            imageUrl = car.imagen;
          } else if (car.exterior && Array.isArray(car.exterior) && car.exterior.length > 0) {
            imageUrl = car.exterior[0];
          } else if (car.cover) {
            imageUrl = car.cover;
          }
          
          return {
            id: car.id,
            brand: car.marca || '',
            model: car.modelo || '',
            version: car.version || null,
            year: car.year || '',
            price: car.precio || '',
            image_url: imageUrl,
            title: car.title || `${car.marca} ${car.modelo} ${car.year}`,
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
      
      // Optimización: Procesar en batches más pequeños
      const BATCH_SIZE = 5;
      const batches = [];
      
      for (let i = 0; i < validCars.length; i += BATCH_SIZE) {
        batches.push(validCars.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`Split cars into ${batches.length} batches of ${BATCH_SIZE} each`);
      
      // Procesar batches secuencialmente para evitar problemas
      let totalUpserted = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} cars`);
        
        try {
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
          console.error('First car in failed batch:', JSON.stringify(batch[0]));
        }
        
        // Pequeña pausa entre batches para evitar sobrecarga
        if (i < batches.length - 1) {
          console.log('Pausing between batches');
          await new Promise(resolve => setTimeout(resolve, 500));
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
