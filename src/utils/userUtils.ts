
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/seller";

// Get user by phone number
export const getUserByPhone = async (phone: string, countryCode: string): Promise<User | null> => {
  try {
    // Use PostgreSQL functions directly and manually cast the response
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .eq('country_code', countryCode)
      .limit(1);
    
    if (error) {
      console.error("Error fetching user by phone:", error);
      return null;
    }
    
    if (data && data.length > 0) {
      // Transform database column names to match our User interface
      return {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        phone: data[0].phone,
        countryCode: data[0].country_code,
        role: data[0].role,
        lastVerified: data[0].last_verified,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at
      } as User;
    }
    
    return null;
  } catch (err) {
    console.error("Exception in getUserByPhone:", err);
    return null;
  }
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        country_code: userData.countryCode,
        role: userData.role || 'both',
        last_verified: userData.lastVerified
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error creating user:", error);
      return null;
    }
    
    // Transform database column names to match our User interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      countryCode: data.country_code,
      role: data.role,
      lastVerified: data.last_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as User;
  } catch (err) {
    console.error("Exception in createUser:", err);
    return null;
  }
};

// Update an existing user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    const updateData: Record<string, unknown> = {};
    
    // Map from User interface field names to database column names
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.countryCode !== undefined) updateData.country_code = userData.countryCode;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.lastVerified !== undefined) updateData.last_verified = userData.lastVerified;
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Exception in updateUser:", err);
    return false;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
    
    if (data) {
      // Transform database column names to match our User interface
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        countryCode: data.country_code,
        role: data.role,
        lastVerified: data.last_verified,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as User;
    }
    
    return null;
  } catch (err) {
    console.error("Exception in getUserById:", err);
    return null;
  }
};

// Check if phone has been verified in last 30 days
export const isPhoneVerifiedRecently = async (phone: string, countryCode: string): Promise<boolean> => {
  try {
    const user = await getUserByPhone(phone, countryCode);
    
    if (!user || !user.lastVerified) {
      return false;
    }
    
    // Check if the last verification was within the last 30 days
    const lastVerified = new Date(user.lastVerified);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return lastVerified > thirtyDaysAgo;
  } catch (err) {
    console.error("Exception in isPhoneVerifiedRecently:", err);
    return false;
  }
};
