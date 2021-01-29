const nodemailer = require('nodemailer');
const dotEnv = require('dotenv');
dotEnv.config();
let mailHelper = {
  sendEmail: (email, html, subject)=>{
    console.log({user: process.env.EMAIL,  pass: process.env.PASSWORD});
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false,
        logger: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });
    const mailOptions = {
      from: 'ahmad\'s blog',
      to: email,
      subject: subject,
      html:html
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        console.log('err:' + err)
      else
        console.log(info);
    });
  }
}
module.exports = mailHelper;
