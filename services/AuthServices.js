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

    // --- FIX: Specific Error Handling ---
    if (error) {
        // This code specifically checks for the Supabase "row not found" error
        if (error.code === 'PGRST116') {
            throw new Error("User not found");
        }
        // Throw any other unexpected database error
        throw error;
    }

    // User was found, now check password
    const valid = await bcrypt.compare(password, data.password);
    
    if (!valid) {
        // This is the "wrong password" case
        throw new Error("Invalid password");
    }
    // --- END FIX ---

    // Login is valid, return user data (without password)
    const { password: _, ...user } = data;
    return user;
}

export async function loginAdmin(rollNumber, password) {
    const { data, error } = await supabase
        .from('admin')
        .select("rollNumber, email, password, name")
        .eq("rollNumber", rollNumber)
        .single();

    // --- FIX: Specific Error Handling ---
    if (error) {
        // This code specifically checks for the Supabase "row not found" error
        if (error.code === 'PGRST116') {
            throw new Error("User not found");
        }
        // Throw any other unexpected database error
        throw error;
    }

    // User was found, now check password
    const valid = await bcrypt.compare(password, data.password);
    
    if (!valid) {
        // This is the "wrong password" case
        throw new Error("Invalid password");
    }
    // --- END FIX ---

    // Login is valid, return user data (without password)
    const { password: _, ...user } = data;
    return user;
}