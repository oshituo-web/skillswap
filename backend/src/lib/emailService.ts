import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendNewMessageEmail = async (to: string, senderName: string, messagePreview: string) => {
    try {
        await resend.emails.send({
            from: 'SkillSwap <notifications@skillswap.app>',
            to,
            subject: `New message from ${senderName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>💬 New Message</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p><strong>${senderName}</strong> sent you a message:</p>
                            <p style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                                "${messagePreview}"
                            </p>
                            <a href="${process.env.FRONTEND_URL}/chat" class="button">View Message</a>
                        </div>
                        <div class="footer">
                            <p>You're receiving this because you have email notifications enabled.</p>
                            <p><a href="${process.env.FRONTEND_URL}/dashboard">Manage preferences</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendExchangeRequestEmail = async (to: string, requesterName: string, skillName: string) => {
    try {
        await resend.emails.send({
            from: 'SkillSwap <notifications@skillswap.app>',
            to,
            subject: `New exchange request for ${skillName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                        .skill-badge { background: #eef2ff; color: #667eea; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔄 New Exchange Request</h1>
                        </div>
                        <div class="content">
                            <p>Great news!</p>
                            <p><strong>${requesterName}</strong> wants to learn your skill:</p>
                            <div class="skill-badge">${skillName}</div>
                            <p>Review their request and see what they're offering in exchange.</p>
                            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Request</a>
                        </div>
                        <div class="footer">
                            <p>You're receiving this because you have email notifications enabled.</p>
                            <p><a href="${process.env.FRONTEND_URL}/dashboard">Manage preferences</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendExchangeAcceptedEmail = async (to: string, providerName: string, skillName: string) => {
    try {
        await resend.emails.send({
            from: 'SkillSwap <notifications@skillswap.app>',
            to,
            subject: `${providerName} accepted your exchange request!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Exchange Accepted!</h1>
                        </div>
                        <div class="content">
                            <p>Congratulations!</p>
                            <p><strong>${providerName}</strong> accepted your exchange request for <strong>${skillName}</strong>.</p>
                            <p>You can now coordinate with them to schedule your skill exchange session.</p>
                            <a href="${process.env.FRONTEND_URL}/chat" class="button">Start Chatting</a>
                        </div>
                        <div class="footer">
                            <p>You're receiving this because you have email notifications enabled.</p>
                            <p><a href="${process.env.FRONTEND_URL}/dashboard">Manage preferences</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
