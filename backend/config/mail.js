import Mailjet from 'node-mailjet';

// Connect to Mailjet with your API keys
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

// Define sendMail function
const sendMail = (to, subject, html) => {
  const request = mailjet
    .post('send', { version: 'v3.1' })
    .request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_USER || "sayanvk90@gmail.com", // sender email
            Name: "DEVI SNACKS"
          },
          To: [
            {
              Email: to, // recipient email
            }
          ],
          Subject: subject,
          HTMLPart: html
        }
      ]
    });

  request
    .then(result => {
      console.log("Mail sent successfully:", result.body);
    })
    .catch(err => {
      console.error("Mail sending error:", err.statusCode, err.message);
    });
};

export default sendMail;
