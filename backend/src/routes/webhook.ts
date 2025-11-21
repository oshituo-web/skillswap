import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase Auth Webhooks are POSTed to this endpoint on a successful signup
router.post('/post-signup', async (req, res) => {
  const expectedSecret = process.env.WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-supabase-event-secret'];

  // 1. Webhook Secret Protection Check
  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret' });
  }

  // Supabase Auth Webhook payload structure
  const { type, record } = req.body;

  // 2. Process only the 'NEW_USER' event
  if (type === 'INSERT' && record && record.email) {
    const userEmail = record.email;

    try {
      // 3. Send Welcome Email via Resend
      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // MUST be a verified domain/email in Resend
        to: userEmail,
        subject: 'Welcome to the Robust Full-Stack App!',
        html: `
          <h1>Hello, ${userEmail}!</h1>
          <p>Welcome to the platform. Your account has been successfully created.</p>
          <p>You can now log in and start using your user dashboard.</p>
          <p>— The Support Team</p>
        `,
      });

      if (error) {
        console.error('Resend Error:', error);
        return res.status(500).json({ error: 'Failed to send welcome email.' });
      }

      console.log(`Welcome email sent successfully to ${userEmail}. Resend ID: ${data?.id}`);
      return res.status(200).json({ message: 'Webhook processed, email sent.' });

    } catch (error) {
      console.error('Server Error during email send:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // 4. Acknowledge and ignore other event types (like UPDATE or DELETE)
  return res.status(200).json({ message: 'Event type ignored.' });
});

export default router;