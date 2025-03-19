
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/seller";

// Get user by phone number
export const getUserByPhone = async (phone: string, countryCode: string): Promise<User | null> => {
  try {
    // Define the types explicitly for the RPC call
    type GetUserByPhoneParams = {
      p_phone: string;
      p_country_code: string;
    };
    
    const { data, error } = await supabase
      .rpc<User[], unknown>('get_user_by_phone', {
        p_phone: phone,
        p_country_code: countryCode 
      } as GetUserByPhoneParams);
    
    if (error) {
      console.error("Error fetching user by phone:", error);
      return null;
    }
    
    if (data && data.length > 0) {
      return data[0] as User;
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
    // Define the types explicitly for the RPC call
    type CreateUserParams = {
      p_name: string;
      p_email: string;
      p_phone: string;
      p_country_code: string;
      p_role?: string;
      p_last_verified?: string | null;
    };
    
    const { data, error } = await supabase
      .rpc<User, unknown>('create_user', {
        p_name: userData.name,
        p_email: userData.email,
        p_phone: userData.phone,
        p_country_code: userData.countryCode,
        p_role: userData.role || 'both',
        p_last_verified: userData.lastVerified
      } as CreateUserParams);
    
    if (error) {
      console.error("Error creating user:", error);
      return null;
    }
    
    return data as User;
  } catch (err) {
    console.error("Exception in createUser:", err);
    return null;
  }
};

// Update an existing user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    // Define the types explicitly for the RPC call
    type UpdateUserParams = {
      p_id: string;
      p_name?: string | null;
      p_email?: string | null;
      p_phone?: string | null;
      p_country_code?: string | null;
      p_role?: string | null;
      p_last_verified?: string | null;
    };
    
    const { error } = await supabase
      .rpc<unknown, unknown>('update_user', {
        p_id: userId,
        p_name: userData.name,
        p_email: userData.email,
        p_phone: userData.phone,
        p_country_code: userData.countryCode,
        p_role: userData.role,
        p_last_verified: userData.lastVerified
      } as UpdateUserParams);
    
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
    // Define the types explicitly for the RPC call
    type GetUserByIdParams = {
      p_id: string;
    };
    
    const { data, error } = await supabase
      .rpc<User, unknown>('get_user_by_id', {
        p_id: userId
      } as GetUserByIdParams);
    
    if (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
    
    if (data) {
      return data as User;
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
