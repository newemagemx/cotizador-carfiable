
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
      console.error('Error fetching existing cars:', fetchError)
      throw new Error(`Error fetching existing cars: ${fetchError.message}`)
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
          console.error(`API returned status: ${response.status} ${response.statusText}`)
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
    
    // Get response as text first for debugging
    const rawResponseText = await apiResponse.text()
    console.log('Raw API response received. Length:', rawResponseText.length)
    
    if (!rawResponseText || rawResponseText.trim() === '') {
      throw new Error('API returned empty response')
    }
    
    // Log sample of the response
    console.log('First 200 characters of response:', rawResponseText.substring(0, 200))
    
    // Parse the response safely with additional error handling
    let responseData
    try {
      responseData = JSON.parse(rawResponseText)
      console.log(`API response parsed. Type: ${typeof responseData}`)
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError)
      console.error('First 500 characters of response:', rawResponseText.substring(0, 500))
      throw new Error(`Failed to parse API response: ${parseError.message}`)
    }
    
    // Extract car data with more robust detection of response structure
    let carsData = []
    
    if (responseData === null) {
      throw new Error('API response data is null')
    }
    
    console.log('Response data type:', typeof responseData)
    
    if (Array.isArray(responseData)) {
      console.log('Response is an array with', responseData.length, 'items')
      carsData = responseData
    } else if (typeof responseData === 'object') {
      console.log('Response is an object, searching for car data array')
      
      // Log all top-level keys
      const keys = Object.keys(responseData)
      console.log('Response object keys:', keys.join(', '))
      
      // Try common property names that might contain car data
      const possibleArrayProperties = ['cars', 'data', 'items', 'results', 'lista', 'vehicles', 'autos']
      
      for (const prop of possibleArrayProperties) {
        if (Array.isArray(responseData[prop]) && responseData[prop].length > 0) {
          console.log(`Found array at property "${prop}" with ${responseData[prop].length} items`)
          carsData = responseData[prop]
          break
        }
      }
      
      // If no array found in common properties, check all properties
      if (carsData.length === 0) {
        for (const key of keys) {
          const value = responseData[key]
          if (Array.isArray(value) && value.length > 0) {
            console.log(`Found array at property "${key}" with ${value.length} items`)
            carsData = value
            break
          }
        }
      }
      
      // Last resort: check if the object itself looks like a car
      if (carsData.length === 0 && responseData.id && (responseData.marca || responseData.brand)) {
        console.log('Response appears to be a single car object. Converting to array')
        carsData = [responseData]
      }
      
      // If still no data, try creating a general array from object values
      if (carsData.length === 0) {
        console.log('No car array found in response, trying to extract from object values')
        const allValues = Object.values(responseData)
        
        for (const value of allValues) {
          if (Array.isArray(value) && value.length > 0) {
            console.log(`Found an array value with ${value.length} items`)
            carsData = value
            break
          }
        }
      }
    }
    
    console.log(`Extracted ${carsData.length} records from API response`)
    
    if (!Array.isArray(carsData)) {
      console.error('Extracted data is not an array:', typeof carsData)
      throw new Error('Failed to extract car data array from API response')
    }
    
    if (carsData.length === 0) {
      console.warn('No cars found in API response')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No cars found in API response',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // Log sample data for debugging
    if (carsData.length > 0) {
      console.log('Sample of first car:', JSON.stringify(carsData[0], null, 2))
    }
    
    // Validate and filter car data with explicit null/undefined checking
    const filteredCars = []
    const skipReasons = {}
    
    for (let i = 0; i < carsData.length; i++) {
      try {
        const car = carsData[i]
        
        // Skip null/undefined entries
        if (car === null || car === undefined) {
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
        
        // Ensure all required properties exist or provide defaults
        const validatedCar = {
          id: car.id,
          marca: car.marca || '',
          modelo: car.modelo || '',
          version: car.version || null,
          year: car.year || '',
          precio: car.precio || '',
          imagen: car.imagen || null,
          title: car.title || car.marca + ' ' + car.modelo || '',
          url: car.url || null,
          registro: car.registro || ''
        }
        
        // Skip entries without registro
        if (!validatedCar.registro) {
          console.warn(`Car ${validatedCar.id} has no registro property, skipping`)
          skipReasons['no_registro'] = (skipReasons['no_registro'] || 0) + 1
          continue
        }
        
        // Skip entries without year
        if (!validatedCar.year) {
          console.warn(`Car ${validatedCar.id} has no year property, skipping`)
          skipReasons['no_year'] = (skipReasons['no_year'] || 0) + 1
          continue
        }
        
        // Safely parse year
        let carYear
        try {
          carYear = parseInt(String(validatedCar.year), 10)
          if (isNaN(carYear)) {
            console.warn(`Car ${validatedCar.id} has invalid year: ${validatedCar.year}, skipping`)
            skipReasons['invalid_year'] = (skipReasons['invalid_year'] || 0) + 1
            continue
          }
        } catch (yearError) {
          console.warn(`Error parsing year for car ${validatedCar.id}: ${yearError}, skipping`)
          skipReasons['year_parse_error'] = (skipReasons['year_parse_error'] || 0) + 1
          continue
        }
        
        // Apply filtering criteria
        if (validatedCar.registro === 'Mexicano de agencia' && carYear >= 2019) {
          filteredCars.push(validatedCar)
        } else {
          skipReasons['not_matching_criteria'] = (skipReasons['not_matching_criteria'] || 0) + 1
        }
      } catch (processingError) {
        console.error(`Error processing car at index ${i}:`, processingError)
        skipReasons['processing_error'] = (skipReasons['processing_error'] || 0) + 1
      }
    }
    
    console.log(`Filtered to ${filteredCars.length} cars matching criteria`)
    console.log('Skip reasons:', JSON.stringify(skipReasons, null, 2))
    
    // Track processed car IDs to avoid duplicates
    const processedCarIds = new Set()
    
    // Prepare array for upsert
    const carsToUpsert = []
    
    // Process each car
    for (const car of filteredCars) {
      try {
        // Skip duplicates
        if (processedCarIds.has(car.id)) {
          console.warn(`Skipping duplicate car ID: ${car.id}`)
          continue
        }
        
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
      } catch (carProcessError) {
        console.error(`Error preparing car ${car.id} for upsert:`, carProcessError)
      }
    }
    
    console.log(`Prepared ${carsToUpsert.length} cars for upsert`)
    
    if (carsToUpsert.length === 0) {
      console.warn('No cars to upsert after processing')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No valid cars found for upsert',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // Split large batches to avoid request size limits
    const BATCH_SIZE = 100
    const batches = []
    
    for (let i = 0; i < carsToUpsert.length; i += BATCH_SIZE) {
      batches.push(carsToUpsert.slice(i, i + BATCH_SIZE))
    }
    
    console.log(`Split cars into ${batches.length} batches of up to ${BATCH_SIZE} records each`)
    
    // Process each batch
    let totalUpserted = 0
    let batchErrors = []
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} cars`)
      
      try {
        const { error: upsertError } = await supabase
          .from('cars')
          .upsert(batch, { onConflict: 'id' })
        
        if (upsertError) {
          console.error(`Error upserting batch ${i+1}:`, upsertError)
          batchErrors.push({
            batch: i+1,
            error: upsertError.message
          })
        } else {
          totalUpserted += batch.length
          console.log(`Successfully upserted batch ${i+1} (${batch.length} cars)`)
        }
      } catch (batchError) {
        console.error(`Error processing batch ${i+1}:`, batchError)
        batchErrors.push({
          batch: i+1,
          error: batchError instanceof Error ? batchError.message : String(batchError)
        })
      }
    }
    
    console.log(`Total cars upserted: ${totalUpserted}`)
    
    // Find car IDs to delete (existing cars not in the current API response)
    let deletedCount = 0
    if (processedCarIds.size > 0) {
      const carIdsToDelete = Array.from(existingCarIds).filter(id => !processedCarIds.has(id as string))
      
      if (carIdsToDelete.length > 0) {
        console.log(`Deleting ${carIdsToDelete.length} cars that are no longer in API`)
        
        try {
          const { error: deleteError, count } = await supabase
            .from('cars')
            .delete({ count: 'exact' })
            .in('id', carIdsToDelete)
          
          if (deleteError) {
            console.error(`Error deleting cars:`, deleteError)
          } else {
            deletedCount = count || 0
            console.log(`Successfully deleted ${deletedCount} cars`)
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
        message: `Processed ${filteredCars.length} cars. Added/updated ${totalUpserted} cars. Deleted ${deletedCount} cars.`,
        stats: {
          total_from_api: carsData.length,
          filtered: filteredCars.length,
          processed: processedCarIds.size,
          upserted: totalUpserted,
          deleted: deletedCount,
          batch_errors: batchErrors.length > 0 ? batchErrors : null
        },
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    // Enhanced error logging
    console.error('Error updating cars:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    
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
    )
  }
})
