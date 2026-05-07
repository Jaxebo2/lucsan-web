import { Resend } from 'resend'

let client: Resend | null = null

export function getResend() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }
    client = new Resend(process.env.RESEND_API_KEY)
  }
  return client
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
