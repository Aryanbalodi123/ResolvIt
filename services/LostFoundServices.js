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
