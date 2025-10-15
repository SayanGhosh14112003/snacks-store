import nodemailer from 'nodemailer';

const sendMail=(to,subject,text)=>{
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      secure:true,
      port:465,
      auth: {
        user: process.env.MAIL_USER,
        pass:process.env.MAIL_PASSWORD
      }
    });
    let mailOptions = {
    from: 'Sayan Ghosh',
    to,
    subject,
    text:text
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
