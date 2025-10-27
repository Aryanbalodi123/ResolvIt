import { supabase } from "../lib/SupabaseClient"; 

// Report a lost item
export async function reportLostItem(payload) {
  const { data, error } = await supabase
    .from("lost_items") 
    .insert([payload]);

  if (error) throw error;
  return data;
}

// Report a found item
export async function reportFoundItem(payload) {
  const { data, error } = await supabase
    .from("found_items") 
    .insert([payload]);

  if (error) throw error;
  return data;
}

// Delete a lost item
export async function deleteLostItem(id) {
  const { error } = await supabase
    .from('lost_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Get all lost items
export async function getLostItems() {
  const { data, error } = await supabase
    .from('lost_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
