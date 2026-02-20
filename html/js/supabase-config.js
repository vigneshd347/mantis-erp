// Supabase Configuration
// Replace these with your actual Supabase project details
const SUPABASE_CONFIG = {
    url: 'https://wkftzlrdtupbfmxfmjqy.supabase.co',
    key: 'sb_publishable_qZKjoHvrmXJdfntV5tMGJg_qi-gZV_C'
};

// Initialize Supabase client
let supabaseClient = null;

console.log("Supabase Config: Initializing...");

try {
    if (typeof supabase !== 'undefined') {
        console.log("Supabase Library detected.");
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL') {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
            console.log("Supabase Client created successfully.");
        } else {
            console.warn("Supabase URL is missing or default. Check your config.");
        }
    } else {
        console.error("Supabase Library (supabase-js) NOT found. Ensure CDN script is loaded correctly.");
    }
} catch (e) {
    console.error("Supabase initialization failed: ", e.message);
}
