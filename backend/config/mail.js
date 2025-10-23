import { MailtrapClient } from "mailtrap"
const client = new MailtrapClient({ token: process.env.MAIL_PASSWORD});
const sendMail=(to,subject,html)=>{
const sender = { name: "DEVI SNACKS", email: process.env.MAIL_USER};
      client.send({
      from: sender,
      to:[{email:to}],
      subject,
      html,
    })
    .then(console.log)
    .catch(console.error);
}
export default sendMail
