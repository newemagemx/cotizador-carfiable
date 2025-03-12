
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Paso 1: Responder inmediatamente para evitar TimeoutError
  const processPromise = processCars();
  
  // Iniciar el proceso en segundo plano sin esperar su finalización
  try {
    EdgeRuntime.waitUntil(processPromise);
  } catch (err) {
    console.error("Error starting background task:", err);
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
  try {
    console.log('Starting car data update in background task');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://maoyslknefzzipdmvbex.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb3lzbGtuZWZ6emlwZG12YmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDE3NjAsImV4cCI6MjA1NzM3Nzc2MH0.gnBYnv8cNazTSFV8QEk499NCoDcsVUlmQHomauC1kqM'
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Optimización: URL de API simplificada con parámetros reducidos
    const apiUrl = 'https://carfiable.mx/lista/?token=CAF001&year=2023,2024,2025&precio=500000,5000000&limit=150'
    console.log(`Fetching cars from API: ${apiUrl}`)
    
    // Optimización: Fetch con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(apiUrl, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
        console.error('No data returned from API');
        return;
      }
      
      // Extract car data array
      let carsData = [];
      
      if (Array.isArray(responseData)) {
        carsData = responseData;
      } else if (typeof responseData === 'object') {
        // Try to find the array in the response object
        for (const key in responseData) {
          if (Array.isArray(responseData[key])) {
            carsData = responseData[key];
            break;
          }
        }
      }
      
      if (carsData.length === 0) {
        console.error('Could not find car data in API response');
        return;
      }
      
      console.log(`Found ${carsData.length} cars in API response`);
      
      // Optimización: Filtrado más eficiente y batch más pequeño
      const validCars = carsData
        .filter(car => 
          car && 
          car.id && 
          car.registro === 'Mexicano de agencia' && 
          car.year && 
          parseInt(String(car.year), 10) >= 2022
        )
        .slice(0, 75) // Limitamos a max 75 coches para procesamiento más rápido
        .map(car => ({
          id: car.id,
          brand: car.marca || '',
          model: car.modelo || '',
          version: car.version || null,
          year: car.year || '',
          price: car.precio || '',
          image_url: car.imagen || null,
          title: car.title || '',
          url: car.url || null,
          registration_type: car.registro || '',
          last_checked: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      
      console.log(`Filtered to ${validCars.length} valid cars`);
      
      if (validCars.length === 0) {
        console.error('No valid cars found after filtering');
        return;
      }
      
      // Optimización: Procesar en batches más pequeños
      const BATCH_SIZE = 10;
      const batches = [];
      
      for (let i = 0; i < validCars.length; i += BATCH_SIZE) {
        batches.push(validCars.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`Split cars into ${batches.length} batches`);
      
      // Procesar batches secuencialmente para evitar problemas
      let totalUpserted = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i+1}/${batches.length}`);
        
        try {
          const { error } = await supabase
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
        }
        
        // Pequeña pausa entre batches para evitar sobrecarga
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(`Background task completed. Total cars upserted: ${totalUpserted}`);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`API fetch error: ${fetchError.message}`);
    }
    
  } catch (error) {
    console.error('Error in background task:', error);
  }
}
