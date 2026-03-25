import { createClient } from '@supabase/supabase-js';

// =========================================================================
// ⚠️ SECURITY BEST PRACTICE: Using Environment Variables
// Your Supabase URL and Anon Key are sensitive and should not be hardcoded
// in your frontend code. They should be stored in environment variables.
//
// How to set up:
// 1. Create a `.env` file in your project root.
// 2. Add your keys:
//    VITE_SUPABASE_URL=https://your-project-id.supabase.co
//    VITE_SUPABASE_ANON_KEY=your-anon-key-here
// 3. Ensure your build system (like Vite) makes these available.
// =========================================================================

// Vite automatically exposes env variables starting with `VITE_` to `import.meta.env`
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'; 

if (SUPABASE_URL === 'https://your-project-id.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key-here') {
    console.warn("Supabase credentials are not configured. Please check your environment variables.");
}

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
