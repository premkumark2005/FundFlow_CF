const sgMail = require('@sendgrid/mail');

/**
 * Initialize SendGrid with API key
 */
const initializeSendGrid = () => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ SENDGRID_API_KEY not configured in environment variables');
    return false;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return true;
};

/**
 * Send email helper function using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise} - Resolves when email is sent
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!initializeSendGrid()) {
      console.error('❌ SendGrid not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
      subject,
      html,
    };

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout')), 10000)
    );

    const sendPromise = sgMail.send(msg);
    
    const response = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`📧 Email sent to ${to} via SendGrid`);
    
    return { success: true, response };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send donation thank-you email to donor
 * @param {Object} donorInfo - Donor information
 * @param {Object} campaignInfo - Campaign information
 * @param {number} amount - Donation amount
 */
const sendDonorThankYouEmail = async (donorInfo, campaignInfo, amount) => {
  const { email, name } = donorInfo;
  const { title, creatorName } = campaignInfo;

  const subject = `Thank you for your donation to "${title}"`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; }
        .campaign-title { font-size: 20px; font-weight: bold; color: #333; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Thank You for Your Generosity!</h1>
        </div>
        <div class="content">
          <p>Hi ${name || 'Generous Donor'},</p>
          
          <p>Thank you so much for your donation! Your contribution makes a real difference.</p>
          
          <div class="campaign-title">Campaign: ${title}</div>
          <div class="amount">$${amount.toFixed(2)}</div>
          
          <p>Your support helps bring this campaign closer to its goal. ${creatorName} and the entire community are grateful for your generosity.</p>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Your donation has been processed successfully</li>
            <li>The campaign creator has been notified</li>
            <li>You can track the campaign's progress anytime</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/campaigns" class="button">View More Campaigns</a>
          
          <p style="margin-top: 30px;">Thank you again for making a difference!</p>
          
          <p>Best regards,<br>The Crowdfunding Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send new donation notification to campaign creator
 * @param {Object} creatorInfo - Campaign creator information
 * @param {Object} campaignInfo - Campaign information
 * @param {Object} donationInfo - Donation details
 */
const sendCreatorDonationNotification = async (creatorInfo, campaignInfo, donationInfo) => {
  const { email, name } = creatorInfo;
  const { title, id } = campaignInfo;
  const { amount, donorName, message, anonymous } = donationInfo;

  const subject = `New donation received for "${title}"! 🎉`;
  
  const displayDonorName = anonymous ? 'An anonymous supporter' : (donorName || 'A supporter');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 36px; font-weight: bold; color: #f5576c; margin: 20px 0; }
        .donor-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
        .message-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 Great News!</h1>
          <p>You received a new donation!</p>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          
          <p>Congratulations! Your campaign "<strong>${title}</strong>" just received a new donation!</p>
          
          <div class="amount">+$${amount.toFixed(2)}</div>
          
          <div class="donor-info">
            <h3>Donation Details</h3>
            <p><strong>From:</strong> ${displayDonorName}</p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          ${message ? `
            <div class="message-box">
              <strong>Message from donor:</strong><br>
              "${message}"
            </div>
          ` : ''}
          
          <p>This donation brings you one step closer to your goal. Keep up the great work and continue engaging with your supporters!</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/campaigns/${id}" class="button">View Campaign Dashboard</a>
          
          <p style="margin-top: 30px;">Keep the momentum going!</p>
          
          <p>Best regards,<br>The Crowdfunding Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendDonorThankYouEmail,
  sendCreatorDonationNotification,
};
