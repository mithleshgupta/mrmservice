const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'records.mrm@gmail.com',
    pass: 'jqgq edfl wyoj ycum', 
  },
});


async function sendOtp(email, phone, otp) {
  if (email) {

    const mailOptions = {
      from: 'records.mrm@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error.message);
      throw new Error('Failed to send OTP email.');
    }
  }

}

module.exports = { sendOtp };