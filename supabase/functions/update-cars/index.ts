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
    
    console.log('Supabase client created, fetching existing cars')
    
    // Fetch existing car IDs from database
    const { data: existingCars, error: fetchError } = await supabase
      .from('cars')
      .select('id')
    
    if (fetchError) {
      throw new Error(`Error fetching existing cars: ${fetchError.message}`)
    }
    
    const existingCarIds = new Set(existingCars?.map(car => car.id) || [])
    console.log(`Found ${existingCarIds.size} existing cars in database`)
    
    // Fetch cars from Carfiable API
    const apiUrl = 'https://carfiable.mx/lista/?token=CAF001&year=2019,2020,2021,2022,2023,2024,2025&precio=9000,5000000&limit=1000'
    console.log(`Fetching cars from API: ${apiUrl}`)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    
    const responseData = await response.json()
    console.log(`API response received. Type: ${typeof responseData}`)
    
    // Check if the API response is an array
    let carsData: CarData[] = []
    
    if (Array.isArray(responseData)) {
      console.log('API response is an array')
      carsData = responseData
    } else if (typeof responseData === 'object' && responseData !== null) {
      // Check if response is an object that might contain cars data
      console.log('API response is an object, checking for data property')
      
      // Try to find an array property in the response object
      const possibleArrayProps = Object.entries(responseData)
        .find(([_, value]) => Array.isArray(value))
      
      if (possibleArrayProps) {
        const [propName, arrayValue] = possibleArrayProps
        console.log(`Found array in response at property: ${propName}`)
        carsData = arrayValue as CarData[]
      } else if (responseData.cars && Array.isArray(responseData.cars)) {
        console.log('Found cars array in response object')
        carsData = responseData.cars
      } else if (responseData.data && Array.isArray(responseData.data)) {
        console.log('Found data array in response object')
        carsData = responseData.data
      } else {
        // If we can't find an array in the response, log the response structure
        console.error('Unable to find cars data in response. Response structure:', JSON.stringify(responseData, null, 2).substring(0, 1000) + '...')
        throw new Error('Invalid API response format: could not find cars array')
      }
    } else {
      console.error('Unexpected API response format:', typeof responseData)
      throw new Error(`Invalid API response format: ${typeof responseData}`)
    }
    
    console.log(`Processing ${carsData.length} cars from API`)
    
    // Filter cars to keep only "Mexicano de agencia" and year >= 2019
    const filteredCars = carsData.filter(car => {
      return car && car.registro === 'Mexicano de agencia' && 
             parseInt(car.year) >= 2019
    })
    
    console.log(`Filtered to ${filteredCars.length} cars matching criteria`)
    
    // Track processed car IDs
    const processedCarIds = new Set<string>()
    
    // Prepare arrays for upsert and deletion
    const carsToUpsert = []
    
    // Process each car
    for (const car of filteredCars) {
      if (!car.id) {
        console.warn('Skipping car without ID:', car)
        continue
      }
      
      processedCarIds.add(car.id)
      
      carsToUpsert.push({
        id: car.id,
        brand: car.marca,
        model: car.modelo,
        version: car.version,
        year: car.year,
        price: car.precio,
        image_url: car.imagen,
        title: car.title,
        url: car.url,
        registration_type: car.registro,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Upsert cars (insert new ones, update existing ones)
    if (carsToUpsert.length > 0) {
      console.log(`Upserting ${carsToUpsert.length} cars to database`)
      const { error: upsertError } = await supabase
        .from('cars')
        .upsert(carsToUpsert, { onConflict: 'id' })
      
      if (upsertError) {
        throw new Error(`Error upserting cars: ${upsertError.message}`)
      }
      
      console.log(`Successfully upserted ${carsToUpsert.length} cars`)
    }
    
    // Find car IDs to delete (existing cars not in the current API response)
    const carIdsToDelete = Array.from(existingCarIds).filter(id => !processedCarIds.has(id as string))
    
    if (carIdsToDelete.length > 0) {
      console.log(`Deleting ${carIdsToDelete.length} cars that are no longer in API`)
      const { error: deleteError } = await supabase
        .from('cars')
        .delete()
        .in('id', carIdsToDelete)
      
      if (deleteError) {
        throw new Error(`Error deleting cars: ${deleteError.message}`)
      }
      
      console.log(`Successfully deleted ${carIdsToDelete.length} cars`)
    } else {
      console.log('No cars to delete')
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${filteredCars.length} cars. Added/updated ${carsToUpsert.length}, removed ${carIdsToDelete.length}`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating cars:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
