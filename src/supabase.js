import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://bvjyvmbdvusbmrjckeuy.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_DtORcLUabLDYYVyh62wLHw_W9ZCmSxo";
export const supabase = createClient(supabaseUrl, supabaseKey);
