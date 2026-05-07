import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gubsouindmdzvfpwrint.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YnNvdWluZG1kenZmcHdyaW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDAyNTAsImV4cCI6MjA5MzU3NjI1MH0.XIFPY6i5fy4PSsxt_dllScWxzU3unI33Lf3QLqcxyCk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
