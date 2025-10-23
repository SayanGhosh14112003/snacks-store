import nodemailer from 'nodemailer';

const sendMail = (to, subject, htmlContent) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Brevo SMTP host
    port: 587,                    // port for TLS
    secure: false,                // false for port 587
    auth: {
      user: process.env.MAIL_USER,     // Brevo verified email
      pass: process.env.MAIL_PASSWORD, // Brevo SMTP key
    },
  });

  // mail options
  const mailOptions = {
    from: `"Sayan Ghosh" <${process.env.MAIL_USER}>`, // must match verified email
    to,
    subject,
    html: htmlContent,
  };

  // send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email sending failed:', error.message);
    } else {
      console.log('✅ Email sent:', info.response);
    }
  });
};

export default sendMail;
