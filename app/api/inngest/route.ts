import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { sendOutreachMessage } from '@/inngest/functions'

// Create an API route that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendOutreachMessage,
    // Add more Inngest functions here as you create them
  ],
})
