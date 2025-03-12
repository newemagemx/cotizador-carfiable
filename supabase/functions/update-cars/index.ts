
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
    
    if (!existingCars) {
      console.warn('No existing cars found in database, will proceed with adding new cars')
    }
    
    const existingCarIds = new Set((existingCars || []).map(car => car.id))
    console.log(`Found ${existingCarIds.size} existing cars in database`)
    
    // Fetch cars from Carfiable API with retries
    const apiUrl = 'https://carfiable.mx/lista/?token=CAF001&year=2019,2020,2021,2022,2023,2024,2025&precio=9000,5000000&limit=1000'
    console.log(`Fetching cars from API: ${apiUrl}`)
    
    // Implement retries for API fetch
    let apiResponse = null
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        console.log(`API fetch attempt ${retryCount + 1}`)
        const response = await fetch(apiUrl, { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }
        
        apiResponse = response
        break
      } catch (fetchError) {
        retryCount++
        console.error(`API fetch attempt ${retryCount} failed:`, fetchError)
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to fetch from API after ${maxRetries} attempts: ${fetchError.message}`)
        }
        
        // Simple exponential backoff
        const delay = Math.pow(2, retryCount) * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    if (!apiResponse) {
      throw new Error('API response is null after retries')
    }
    
    // Log the raw response for debugging
    let rawResponseText
    try {
      rawResponseText = await apiResponse.text()
      console.log('Raw API response received. Length:', rawResponseText.length)
      console.log('First 200 characters:', rawResponseText.substring(0, 200))
    } catch (textError) {
      console.error('Failed to get API response text:', textError)
      throw new Error(`Failed to get API response text: ${textError.message}`)
    }
    
    if (!rawResponseText || rawResponseText.trim() === '') {
      throw new Error('API returned empty response')
    }
    
    // Parse the response safely
    let responseData
    try {
      responseData = JSON.parse(rawResponseText)
      console.log(`API response parsed. Type: ${typeof responseData}`)
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError)
      console.error('First 500 characters of response:', rawResponseText.substring(0, 500))
      throw new Error(`Failed to parse API response: ${parseError.message}`)
    }
    
    // Extract car data from various possible response formats
    let carsData: any[] = []
    
    console.log('Response type:', typeof responseData)
    
    if (responseData === null) {
      throw new Error('API response data is null')
    }
    
    if (Array.isArray(responseData)) {
      console.log('API response is an array with', responseData.length, 'items')
      carsData = responseData
    } else if (typeof responseData === 'object') {
      console.log('API response is an object, checking for data arrays')
      
      // Log available properties for debugging
      const keys = Object.keys(responseData)
      console.log('Response object keys:', keys.join(', '))
      
      // Try to find any array property that might contain car data
      let foundArray = false
      
      for (const key of keys) {
        const value = responseData[key]
        if (Array.isArray(value) && value.length > 0) {
          console.log(`Found array at property "${key}" with ${value.length} items`)
          carsData = value
          foundArray = true
          break
        }
      }
      
      if (!foundArray) {
        // Last resort: try to use the object itself if it has car-like properties
        if (responseData.id && responseData.marca) {
          console.log('Response appears to be a single car object. Converting to array')
          carsData = [responseData]
        } else {
          console.error('Unable to find cars data array in response')
          console.error('Response structure:', JSON.stringify(responseData, null, 2).substring(0, 1000))
          throw new Error('Could not find car data array in API response')
        }
      }
    } else {
      console.error('Unexpected API response format:', typeof responseData)
      throw new Error(`Invalid API response format: ${typeof responseData}`)
    }
    
    console.log(`Initially extracted ${carsData.length} records from API response`)
    
    // Validate car data is an array
    if (!Array.isArray(carsData)) {
      console.error('Extracted cars data is not an array:', typeof carsData)
      throw new Error('Extracted car data is not an array')
    }
    
    // Log sample data
    console.log('Sample of first car data (if available):', 
                carsData.length > 0 ? JSON.stringify(carsData[0], null, 2) : 'No cars found')
    
    // Use manual filtering instead of .filter to avoid issues
    const filteredCars: CarData[] = []
    const skipReasons: Record<string, number> = {}
    
    console.log(`Starting to process ${carsData.length} car records...`)
    
    for (let i = 0; i < carsData.length; i++) {
      try {
        const car = carsData[i]
        
        // Skip null/undefined entries
        if (!car) {
          console.warn(`Car at index ${i} is null or undefined, skipping`)
          skipReasons['null_or_undefined'] = (skipReasons['null_or_undefined'] || 0) + 1
          continue
        }
        
        // Skip non-object entries
        if (typeof car !== 'object') {
          console.warn(`Car at index ${i} is not an object (type: ${typeof car}), skipping`)
          skipReasons['not_object'] = (skipReasons['not_object'] || 0) + 1
          continue
        }
        
        // Skip entries without ID
        if (!car.id) {
          console.warn(`Car at index ${i} has no ID, skipping`)
          skipReasons['no_id'] = (skipReasons['no_id'] || 0) + 1
          continue
        }
        
        // Skip entries without registro
        if (!car.registro) {
          console.warn(`Car ${car.id} has no registro property, skipping`)
          skipReasons['no_registro'] = (skipReasons['no_registro'] || 0) + 1
          continue
        }
        
        // Skip entries without year
        if (!car.year) {
          console.warn(`Car ${car.id} has no year property, skipping`)
          skipReasons['no_year'] = (skipReasons['no_year'] || 0) + 1
          continue
        }
        
        // Parse year safely (it might be a string or number)
        let carYear: number
        try {
          carYear = parseInt(car.year.toString(), 10)
          if (isNaN(carYear)) {
            console.warn(`Car ${car.id} has invalid year: ${car.year}, skipping`)
            skipReasons['invalid_year'] = (skipReasons['invalid_year'] || 0) + 1
            continue
          }
        } catch (yearError) {
          console.warn(`Error parsing year for car ${car.id}: ${yearError}, skipping`)
          skipReasons['year_parse_error'] = (skipReasons['year_parse_error'] || 0) + 1
          continue
        }
        
        // Apply filtering criteria
        if (car.registro === 'Mexicano de agencia' && carYear >= 2019) {
          filteredCars.push(car as CarData)
        } else {
          skipReasons['not_matching_criteria'] = (skipReasons['not_matching_criteria'] || 0) + 1
        }
      } catch (processingError) {
        console.warn(`Error processing car at index ${i}:`, processingError)
        skipReasons['processing_error'] = (skipReasons['processing_error'] || 0) + 1
      }
    }
    
    console.log(`Filtered to ${filteredCars.length} cars matching criteria`)
    console.log('Skip reasons:', JSON.stringify(skipReasons, null, 2))
    
    // Track processed car IDs
    const processedCarIds = new Set<string>()
    
    // Prepare array for upsert
    const carsToUpsert = []
    let validCarsCount = 0
    
    // Process each car
    for (const car of filteredCars) {
      try {
        // We already validated ID existence above, but double-check
        if (!car.id) continue
        
        // Detect duplicates
        if (processedCarIds.has(car.id)) {
          console.warn(`Skipping duplicate car ID: ${car.id}`)
          continue
        }
        
        processedCarIds.add(car.id)
        validCarsCount++
        
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
      } catch (carProcessError) {
        console.error(`Error preparing car ${car.id} for upsert:`, carProcessError)
        // Continue with next car instead of failing entirely
      }
    }
    
    console.log(`Prepared ${carsToUpsert.length} of ${validCarsCount} valid cars for upsert`)
    
    // Split large batches to avoid request size limits
    const BATCH_SIZE = 200
    const batches = []
    
    for (let i = 0; i < carsToUpsert.length; i += BATCH_SIZE) {
      batches.push(carsToUpsert.slice(i, i + BATCH_SIZE))
    }
    
    console.log(`Split cars into ${batches.length} batches of up to ${BATCH_SIZE} records each`)
    
    // Process each batch
    let totalUpserted = 0
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} cars`)
      
      try {
        const { error: upsertError } = await supabase
          .from('cars')
          .upsert(batch, { onConflict: 'id' })
        
        if (upsertError) {
          console.error(`Error upserting batch ${i+1}:`, upsertError)
        } else {
          totalUpserted += batch.length
          console.log(`Successfully upserted batch ${i+1} (${batch.length} cars)`)
        }
      } catch (batchError) {
        console.error(`Error processing batch ${i+1}:`, batchError)
      }
    }
    
    console.log(`Total cars upserted: ${totalUpserted}`)
    
    // Find car IDs to delete (existing cars not in the current API response)
    if (processedCarIds.size > 0) {
      const carIdsToDelete = Array.from(existingCarIds).filter(id => !processedCarIds.has(id as string))
      
      if (carIdsToDelete.length > 0) {
        console.log(`Deleting ${carIdsToDelete.length} cars that are no longer in API`)
        
        try {
          const { error: deleteError } = await supabase
            .from('cars')
            .delete()
            .in('id', carIdsToDelete)
          
          if (deleteError) {
            console.error(`Error deleting cars:`, deleteError)
          } else {
            console.log(`Successfully deleted ${carIdsToDelete.length} cars`)
          }
        } catch (deleteError) {
          console.error(`Error in delete operation:`, deleteError)
        }
      } else {
        console.log('No cars to delete')
      }
    } else {
      console.log('No cars were processed, skipping delete operation')
    }
    
    // Final response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${filteredCars.length} cars. Added/updated ${totalUpserted} cars.`,
        stats: {
          total_from_api: carsData.length,
          filtered: filteredCars.length,
          processed: processedCarIds.size,
          upserted: totalUpserted
        },
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
