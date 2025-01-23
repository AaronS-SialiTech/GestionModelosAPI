import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pkfedvxcxqfqzwxttlmq.supabase.co'
  const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZmVkdnhjeHFmcXp3eHR0bG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTY1MDIsImV4cCI6MjA1MTEzMjUwMn0.pjkKhQc9Ruwi_44q2lCv-wTv5e3oZYxI_idkC1tTQQM';


export const supabase = createClient(supabaseUrl, supabaseKey)

if (!supabase) {
  throw new Error('No Supabase client')
}
else {
  console.log('Supabase client created')

}

