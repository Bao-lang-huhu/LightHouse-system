const { createClient } = require('@supabase/supabase-js');

// Your Supabase URL and public API key from your Supabase dashboard
const supabaseUrl = 'https://qerqnluaffgbdvlkygpa.supabase.co';
//const supabaseUrl ='https://wrhuphjctglbnbpqtequ.supabase.co';
//const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnFubHVhZmZnYmR2bGt5Z3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDA1ODk1OCwiZXhwIjoyMDQ1NjM0OTU4fQ.MzOOYe1DktKd_3gQ8f-M5wyDCkIg_f_AQ8sHy88OXnA';
const supabaseAnonKey= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnFubHVhZmZnYmR2bGt5Z3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDA1ODk1OCwiZXhwIjoyMDQ1NjM0OTU4fQ.MzOOYe1DktKd_3gQ8f-M5wyDCkIg_f_AQ8sHy88OXnA'
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };
