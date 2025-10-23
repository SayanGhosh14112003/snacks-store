import nodemailer from 'nodemailer';

const sendMail=(to,subject,htmlContent)=>{
    let transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port:587,
      secure:false,
      auth: {
        user: process.env.MAIL_USER,
        pass:process.env.MAIL_PASSWORD
      }
    });
    let mailOptions = {
    from: 'Sayan Ghosh',
    to,
    subject,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  }); 
}
export default sendMail;
