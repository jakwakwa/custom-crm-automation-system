import { inngest } from '@/lib/inngest'
import { prisma } from '@/lib/prisma'
import twilio from 'twilio'
import { Resend } from 'resend'

// Initialize messaging clients
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Inngest function to send outreach messages
export const sendOutreachMessage = inngest.createFunction(
  { id: 'send-outreach-message', name: 'Send Outreach Message' },
  { event: 'outreach/send.message' },
  async ({ event, step }) => {
    const { personId, sequenceId, stepId, channel, body, subject } = event.data

    // Fetch person details
    const person = await step.run('fetch-person', async () => {
      return await prisma.person.findUnique({
        where: { id: personId },
      })
    })

    if (!person) {
      throw new Error(`Person ${personId} not found`)
    }

    // Send message based on channel
    const result = await step.run('send-message', async () => {
      switch (channel) {
        case 'EMAIL':
          if (!resendClient) {
            throw new Error('Resend client not configured')
          }
          const emailResult = await resendClient.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
            to: person.email,
            subject: subject || 'Message from CRM',
            html: body,
          })
          return { provider: 'resend', messageId: emailResult.data?.id }

        case 'WHATSAPP':
          if (!twilioClient || !person.whatsapp) {
            throw new Error('Twilio client not configured or WhatsApp number missing')
          }
          const whatsappResult = await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${person.whatsapp}`,
            body,
          })
          return { provider: 'twilio', messageId: whatsappResult.sid }

        case 'SMS':
          if (!twilioClient || !person.phone) {
            throw new Error('Twilio client not configured or phone number missing')
          }
          const smsResult = await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: person.phone,
            body,
          })
          return { provider: 'twilio', messageId: smsResult.sid }

        default:
          throw new Error(`Unsupported channel: ${channel}`)
      }
    })

    // Record message in database
    await step.run('record-message', async () => {
      await prisma.message.create({
        data: {
          personId,
          channel,
          subject,
          body,
          status: 'SENT',
          sentAt: new Date(),
          twilioMessageId: result.provider === 'twilio' ? result.messageId : undefined,
          resendMessageId: result.provider === 'resend' ? result.messageId : undefined,
        },
      })
    })

    // Update sequence step if provided
    if (sequenceId && stepId) {
      await step.run('update-sequence-step', async () => {
        await prisma.sequenceStep.update({
          where: { id: stepId },
          data: {
            executed: true,
            executedAt: new Date(),
          },
        })
      })
    }

    return { success: true, messageId: result.messageId }
  }
)
