import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://YOUR-PROJECT-ID.supabase.co",
    "YOUR-ANON-PUBLIC-KEY"
);