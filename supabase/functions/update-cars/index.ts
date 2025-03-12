
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
    
    // Log the raw response for debugging
    const rawResponse = await response.text()
    console.log('Raw API response received. Length:', rawResponse.length)
    
    // Parse the response safely
    let responseData
    try {
      responseData = JSON.parse(rawResponse)
      console.log(`API response parsed. Type: ${typeof responseData}`)
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError)
      console.error('First 500 characters of response:', rawResponse.substring(0, 500))
      throw new Error(`Failed to parse API response: ${parseError.message}`)
    }
    
    // Safely extract car data
    let carsData: CarData[] = []
    
    if (Array.isArray(responseData)) {
      console.log('API response is an array with', responseData.length, 'items')
      carsData = responseData
    } else if (typeof responseData === 'object' && responseData !== null) {
      console.log('API response is an object, checking for data arrays')
      
      // Log available properties for debugging
      console.log('Response object properties:', Object.keys(responseData))
      
      // Check common properties where car data might be stored
      if (responseData.cars && Array.isArray(responseData.cars)) {
        console.log('Found cars array with', responseData.cars.length, 'items')
        carsData = responseData.cars
      } else if (responseData.data && Array.isArray(responseData.data)) {
        console.log('Found data array with', responseData.data.length, 'items')
        carsData = responseData.data
      } else if (responseData.results && Array.isArray(responseData.results)) {
        console.log('Found results array with', responseData.results.length, 'items')
        carsData = responseData.results
      } else if (responseData.items && Array.isArray(responseData.items)) {
        console.log('Found items array with', responseData.items.length, 'items')
        carsData = responseData.items
      } else {
        // Try to find any array property in the response
        for (const [key, value] of Object.entries(responseData)) {
          if (Array.isArray(value) && value.length > 0) {
            console.log(`Found array at property "${key}" with ${value.length} items`)
            carsData = value as CarData[]
            break
          }
        }
        
        // If we still couldn't find an array, log detailed info
        if (carsData.length === 0) {
          console.error('Unable to find cars data array in response')
          console.error('Response structure (first 1000 chars):', 
                      JSON.stringify(responseData, null, 2).substring(0, 1000))
          throw new Error('Could not find car data array in API response')
        }
      }
    } else {
      console.error('Unexpected API response format:', typeof responseData)
      throw new Error(`Invalid API response format: ${typeof responseData}`)
    }
    
    console.log(`Successfully extracted ${carsData.length} car records from API response`)
    
    // Validate car data before filtering
    if (!Array.isArray(carsData)) {
      console.error('Extracted cars data is not an array:', typeof carsData)
      throw new Error('Extracted car data is not an array')
    }
    
    console.log('Sample of first car data (if available):', 
                carsData.length > 0 ? JSON.stringify(carsData[0], null, 2) : 'No cars found')
    
    // Safely filter cars with proper error handling
    const filteredCars = []
    for (const car of carsData) {
      try {
        if (!car) {
          console.warn('Skipping null or undefined car entry')
          continue
        }
        
        if (typeof car !== 'object') {
          console.warn(`Skipping non-object car entry of type ${typeof car}`)
          continue
        }
        
        if (!car.id) {
          console.warn('Skipping car without ID:', car)
          continue
        }
        
        if (!car.registro) {
          console.warn('Skipping car without registro property:', car.id)
          continue
        }
        
        if (!car.year) {
          console.warn('Skipping car without year property:', car.id)
          continue
        }
        
        // Apply filtering criteria
        if (car.registro === 'Mexicano de agencia' && parseInt(car.year) >= 2019) {
          filteredCars.push(car)
        }
      } catch (filterError) {
        console.warn('Error processing car data:', filterError, 'Car:', car)
        // Continue with the next car instead of failing the entire operation
      }
    }
    
    console.log(`Filtered to ${filteredCars.length} cars matching criteria`)
    
    // Track processed car IDs
    const processedCarIds = new Set<string>()
    
    // Prepare array for upsert
    const carsToUpsert = []
    
    // Process each car
    for (const car of filteredCars) {
      // We already validated ID existence above, but double-check
      if (!car.id) continue
      
      processedCarIds.add(car.id)
      
      carsToUpsert.push({
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
    } else {
      console.log('No cars to upsert')
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
