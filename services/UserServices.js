import { supabase } from "../lib/SupabaseClient";

export const getUserDetails = async (userId) => {
  try {
    // Convert userId to number if it's a string
    const parsedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('rollNumber', parsedUserId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    throw error;
  }
};

export const getUserComplaints = async (userId) => {
  try {
    // Convert userId to number if it's a string
    const parsedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    const { data, error } = await supabase
      .from('complaints')
      .select(`
        complaint_id,
        title,
        description,
        status,
        created_at,
        location,
        category,
        priority,
        user_id
      `)
      .eq('user_id', parsedUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user complaints:', error.message);
    throw error;
  }
};

export const getUserLostItems = async (userId) => {
  try {
    // Convert userId to number if it's a string
    const parsedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    const { data, error } = await supabase
      .from('lost_found')
      .select(`
        lost_id,
        title,
        description,
        date_lost,
        isResolved,
        lostimage,
        location,
        category,
        reward,
        distinguishing_features,
        contact_details
      `)
      .eq('user_id', userId)
      .order('date_lost', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lost items:', error.message);
    throw error;
  }
};