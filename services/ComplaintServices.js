import { supabase } from "../lib/SupabaseClient";

export async function sendComplaint(complaintPayload) {
    
    const {data,error} = await supabase
    .from('complaints')
    .insert([complaintPayload])

    if (error) throw error;
    return data;
}