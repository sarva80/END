// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohgpvwfyvyqtfuvossu.supabase.co'; // your actual Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaGdwdndmeXZ5cXRmdXZvc3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTcxMDAsImV4cCI6MjA2MzQ5MzEwMH0.LfqrA-VFwSdzdzVT0Fe9shQSE54hdDyIG6SiYtq200M'; // your anon public key

export const supabase = createClient(supabaseUrl, supabaseKey);
// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohgpvwfyvyqtfuvossu.supabase.co'; // your actual Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaGdwdndmeXZ5cXRmdXZvc3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTcxMDAsImV4cCI6MjA2MzQ5MzEwMH0.LfqrA-VFwSdzdzVT0Fe9shQSE54hdDyIG6SiYtq200M'; // your anon public key

export const supabase = createClient(supabaseUrl, supabaseKey);
