
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
        status: 204,
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Parse the request body
    const body = await req.json();
    const { action, ...params } = body;

    // Handle different actions
    let result = null;
    let error = null;

    switch (action) {
      case 'getUserByPhone':
        result = await getUserByPhone(params.phone, params.countryCode);
        break;
      case 'createUser':
        result = await createUser(params);
        break;
      case 'updateUser':
        result = await updateUser(params.id, params.userData);
        break;
      case 'getUserById':
        result = await getUserById(params.id);
        break;
      default:
        error = 'Invalid action';
    }

    if (error) {
      return new Response(JSON.stringify({ error }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Get user by phone number
async function getUserByPhone(phone: string, countryCode: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .eq('country_code', countryCode)
    .limit(1)
    .single();

  if (error) {
    console.error('Error in getUserByPhone:', error);
    return null;
  }

  return data;
}

// Create a new user
async function createUser(userData: any) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      country_code: userData.countryCode,
      role: userData.role || 'both',
      last_verified: userData.lastVerified,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error in createUser:', error);
    return null;
  }

  return data;
}

// Update an existing user
async function updateUser(id: string, userData: any) {
  const updateData: any = {};

  // Only include fields that are provided
  if (userData.name) updateData.name = userData.name;
  if (userData.email) updateData.email = userData.email;
  if (userData.phone) updateData.phone = userData.phone;
  if (userData.countryCode) updateData.country_code = userData.countryCode;
  if (userData.role) updateData.role = userData.role;
  if (userData.lastVerified) updateData.last_verified = userData.lastVerified;
  
  // Always update the updated_at field
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error in updateUser:', error);
    return null;
  }

  return data;
}

// Get user by ID
async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .limit(1)
    .single();

  if (error) {
    console.error('Error in getUserById:', error);
    return null;
  }

  return data;
}
