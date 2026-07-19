const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"EnergyGuard" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'EnergyGuard — Your Verification Code',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #551F22;">EnergyGuard</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 8px; color: #301415;">${otp}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };