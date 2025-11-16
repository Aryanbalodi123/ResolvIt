import { supabase } from "../lib/SupabaseClient";

// Report a lost item
export async function reportLostItem(payload) {
  const { data, error } = await supabase
    .from("lost_found")
    .insert([{
      title: payload.title,
      description: payload.description,
      location: payload.location,
      category: payload.category,
      contact_details: payload.contactDetails,
      date_lost: payload.dateLost,
      distinguishing_features: payload.distinguishingFeatures,
      isResolved: false,
      user_id: payload.user_id,
      type: 'lost' // Mark as lost item
    }])
    .select();

  if (error) throw error;
  return data;
}

// Report a found item
export async function reportFoundItem(payload) {
  const { data, error } = await supabase
    .from("lost_found")
    .insert([{
      title: payload.title,
      description: payload.description,
      location: payload.location,
      category: payload.category,
      contact_details: payload.contactDetails,
      date_lost: payload.dateFound,
      isResolved: false,
      user_id: payload.user_id,
      type: 'found' // Mark as found item
    }])
    .select();

  if (error) throw error;
  return data;
}

// Delete a lost item
export async function deleteLostItem(id) {
  const { error } = await supabase
    .from('lost_found')
    .delete()
    .eq('lost_id', id);

  if (error) throw error;
}

// Get only lost items
export async function getLostItems() {
  const { data, error } = await supabase
    .from('lost_found')
    .select('*')
    .eq('type', 'lost')
    .order('lost_id', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get only found items
export async function getFoundItems() {
  const { data, error } = await supabase
    .from('lost_found')
    .select('*')
    .eq('type', 'found')
    .order('lost_id', { ascending: false });

  if (error) throw error;
  return data || [];
}