// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// 🔹 Using your Axela Supabase project directly (no env vars, no electron stuff)
const supabaseUrl = "https://zpybzbudxdznzehulgyx.supabase.co";

const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpweWJ6YnVkeGR6bnplaHVsZ3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ0MjIsImV4cCI6MjA3NzE3MDQyMn0.vw_9FtwUIri__rBvbowPL39PsJnRaywMXD79VW_jtBw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);