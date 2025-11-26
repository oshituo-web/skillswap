import express from 'express';
import { Resend } from 'resend';

const router = express.Router();

// Initialize Resend with API key from env or a placeholder if missing
// Note: In production, ensure RESEND_API_KEY is set.
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // If no API key is set, simulate success and log to console
        if (!process.env.RESEND_API_KEY) {
            console.log('--- SIMULATED EMAIL ---');
            console.log(`To: Admin <admin@skillswap.com>`);
            console.log(`From: ${name} <${email}>`);
            console.log(`Subject: ${subject}`);
            console.log(`Message: ${message}`);
            console.log('-----------------------');
            return res.status(200).json({ message: 'Message sent successfully (Simulated)' });
        }

        const data = await resend.emails.send({
            from: 'SkillSwap Contact <onboarding@resend.dev>', // Use verified domain in prod
            to: ['admin@skillswap.com'], // Replace with actual admin email
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h2>New Message from ${name}</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        res.status(200).json({ message: 'Message sent successfully', data });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
