import { supabase } from "../lib/SupabaseClient";

export async function sendComplaint(complaintPayload) {
    
    const {data,error} = await supabase
    .from('complaints')
    .insert([complaintPayload])

    if (error) throw error;
    return data;
}

export async function retrieveComplaint() {
    const {data,error} = await supabase
    .from('complaints')
    .select("*")

    if(error) throw error
    return data;
}
