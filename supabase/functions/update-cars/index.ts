
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CarData {
  id: string
  marca: string
  modelo: string
  version: string
  year: string
  precio: string
  imagen: string
  title: string
  url: string
  registro: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting car data update')
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://maoyslknefzzipdmvbex.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb3lzbGtuZWZ6emlwZG12YmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDE3NjAsImV4cCI6MjA1NzM3Nzc2MH0.gnBYnv8cNazTSFV8QEk499NCoDcsVUlmQHomauC1kqM'
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Simplified API URL with fewer parameters to reduce response size
    const apiUrl = 'https://carfiable.mx/lista/?token=CAF001&year=2019,2020,2021,2022,2023,2024,2025&precio=500000,5000000&limit=300'
    console.log(`Fetching cars from API: ${apiUrl}`)
    
    // Simplified API fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
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
        return new Response(
          JSON.stringify({
            success: false,
            message: 'No data returned from API',
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
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
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Could not find car data in API response',
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      console.log(`Found ${carsData.length} cars in API response`);
      
      // Filter and validate cars
      const validCars = carsData
        .filter(car => 
          car && 
          car.id && 
          car.registro === 'Mexicano de agencia' && 
          car.year && 
          parseInt(String(car.year), 10) >= 2019
        )
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
        return new Response(
          JSON.stringify({
            success: false,
            message: 'No valid cars found after filtering',
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Process in smaller batches
      const BATCH_SIZE = 25;
      const batches = [];
      
      for (let i = 0; i < validCars.length; i += BATCH_SIZE) {
        batches.push(validCars.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`Split cars into ${batches.length} batches`);
      
      // Upsert cars in background task to avoid timeout
      const processBatches = async () => {
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
        }
        
        console.log(`Background task completed. Total cars upserted: ${totalUpserted}`);
      };
      
      // Start background task
      try {
        EdgeRuntime.waitUntil(processBatches());
      } catch (err) {
        console.error("Error starting background task:", err);
        // If waitUntil fails, just process the first batch synchronously
        if (batches.length > 0) {
          try {
            const { error } = await supabase
              .from('cars')
              .upsert(batches[0], { onConflict: 'id' });
            
            if (error) {
              console.error("Error upserting first batch:", error);
            } else {
              console.log(`Upserted first batch of ${batches[0].length} cars`);
            }
          } catch (err) {
            console.error("Error processing first batch:", err);
          }
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Processing ${validCars.length} cars in background`,
          stats: {
            total_from_api: carsData.length,
            valid_cars: validCars.length,
            batches: batches.length
          },
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 202, // Accepted
        }
      );
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw new Error(`API fetch error: ${fetchError.message}`);
    }
    
  } catch (error) {
    console.error('Error updating cars:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
