import { supabase } from "../lib/SupabaseClient";

/**
 * Fetches all complaints from the database.
 * Joins with the 'users' table to get the name of the user who filed it.
 */
export async function getAllComplaints() {
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      user:users(name, rollNumber)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all complaints:', error.message);
    throw error;
  }
  
  return data;
}

/**
 * Updates a specific complaint by its ID.
 * Used for assigning to a department, changing status, or updating priority.
 * @param {bigint} complaintId - The ID of the complaint to update.
 * @param {object} updates - An object containing the fields to update (e.g., { assigned_to, status, priority }).
 */
export async function updateComplaint(complaintId, updates) {
  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('complaint_id', complaintId)
    .select(`
      *,
      user:users(name, rollNumber)
    `) // Return the updated row with user info
    .single();

  if (error) {
    console.error('Error updating complaint:', error.message);
    throw error;
  }
  
  return data;
}