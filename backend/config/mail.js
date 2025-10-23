import nodemailer from 'nodemailer';

const sendMail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: `"Sayan Ghosh" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('❌ sendMail error:', error.message);
    return false;
  }
};

export default sendMail;
