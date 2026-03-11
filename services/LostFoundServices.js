import { supabase } from "../lib/SupabaseClient";

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
      type: 'lost'
    }])
    .select();

  if (error) throw error;
  return data;
}

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
      type: 'found'
    }])
    .select();

  if (error) throw error;
  return data;
}

export async function deleteLostItem(id) {
  const { error } = await supabase
    .from('lost_found')
    .delete()
    .eq('lost_id', id);

  if (error) throw error;
}

export async function getLostItems() {
  const { data, error } = await supabase
    .from('lost_found')
    .select('*')
    .eq('type', 'lost')
    .order('lost_id', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFoundItems() {
  const { data, error } = await supabase
    .from('lost_found')
    .select('*')
    .eq('type', 'found')
    .order('lost_id', { ascending: false });

  if (error) throw error;
  return data || [];
}