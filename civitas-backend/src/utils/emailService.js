const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendEmail = async (toEmail, subject, htmlBody) => { 
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: subject, 
    html: htmlBody, 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail} with subject: "${subject}"`);
    return { success: true, message: 'Email sent.' };
  } catch (error) {
    console.error(`Error sending email to ${toEmail} with subject "${subject}":`, error);
    return { success: false, message: 'Failed to send email.' };
  }
};
const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const subject = 'Civitas Password Reset';
  const htmlBody = `
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return await sendEmail(toEmail, subject, htmlBody);
};
module.exports = {
  sendEmail,
  sendPasswordResetEmail, 
};