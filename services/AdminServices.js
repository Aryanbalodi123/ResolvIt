import { supabase } from "../lib/SupabaseClient";

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


export async function updateComplaint(complaintId, updates) {
  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('complaint_id', complaintId)
    .select(`
      *,
      user:users(name, rollNumber)
    `) 
    .single();

  if (error) {
    console.error('Error updating complaint:', error.message);
    throw error;
  }
  
  return data;
}