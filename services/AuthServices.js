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

export async function loginUser(rollNumber, password) {
    const { data, error } = await supabase
        .from('users')
        .select("rollNumber, email, password, name")
        .eq("rollNumber", rollNumber)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new Error("User not found");
        }
        throw error;
    }

    const valid = await bcrypt.compare(password, data.password);
    
    if (!valid) {
        throw new Error("Invalid password");
    }

    const { password: _, ...user } = data;
    return user;
}

export async function loginAdmin(rollNumber, password) {
    const { data, error } = await supabase
        .from('admin')
        .select("rollNumber, email, password, name")
        .eq("rollNumber", rollNumber)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new Error("User not found");
        }
        throw error;
    }

    const valid = await bcrypt.compare(password, data.password);
    
    if (!valid) {
        throw new Error("Invalid password");
    }

    const { password: _, ...user } = data;
    return user;
}