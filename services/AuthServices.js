import { supabase } from "../lib/SupabaseClient";
import bcrypt from "bcryptjs";

export async function registerAdmin(registerAdminPayload) {
    const {data, error} = await supabase
        .from('admin')
        .insert([registerAdminPayload])
    
        if (error) throw error;
        return data;
}

export async function registerUser(registerUserPayload) {
    const {data, error} = await supabase
        .from('users')
        .insert([registerUserPayload])
    
        if (error) throw error;
        return data;
}

export async function loginUser(rollNumber,password) {
    const{data,error} = await supabase
    .from('users')
    .select("rollNumber, email, password, name")
    .eq("rollNumber",rollNumber)
    .single();

    if (error) throw error;
    if (!data) throw new Error("No data found");

    const valid = await bcrypt.compare(password , data.password);
      if (!valid) throw new Error("Invalid credentials");

  const { password: _, ...user } = data;
  return user;

}