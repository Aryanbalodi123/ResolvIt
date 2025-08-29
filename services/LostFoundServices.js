import { supabase } from "../lib/SupabaseClient";

export async function reportLostItem(lostPayload) {
    
    const {data,error} = await supabase
    .from('lost_found')
    .insert([lostPayload])

    if (error) throw error;
    return data;
}