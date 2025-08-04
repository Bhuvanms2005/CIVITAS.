const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Use environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

router.post('/send-message', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All required fields must be filled." });
  }

  try {
    // Create transporter using env variables
    let transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_USER, 
        pass: EMAIL_PASS, 
      },
    });

    // Email content
    let mailOptions = {
      from: `"Civitas Contact Form" <${email}>`,
      to: EMAIL_USER, // Sends email to your official Civitas email
      subject: `New Contact Form Message from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        Message:
        ${message}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
