const sendGridEmail = require('@sendgrid/mail');
const { SERVER, EMAILS } = require('../config');

sendGridEmail.setApiKey(EMAILS['api-key']);

const verifyAccountTemplate = (firstName, lastName, email, token) => {
  const msg = {
    to: email,
    subject: 'Please verify your account',
    text: 'Please verify your account',
    html: `<html>
    <div style="text-align: center;">
        <h1>Please verify your account</h1>
        <a href="${SERVER.baseUrl}/v1/user/email-verification/${token}">
        Dear ${firstName} ${lastName}, Please verify your account.<a/>
    </div>
  </html>`
  };
  return msg;
};

const resetPasswordTemplate = (firstName, lastName, email, token) => {
  const msg = {
    to: email,
    subject: 'Reset your password',
    text: 'Reset your password',
    html: `<html>
    <div style="text-align: center;">
        <h1>Please reset your password</h1>
        <a href="${SERVER.website}/reset-password/${token}">
        Dear ${firstName} ${lastName}, Please reset your password.<a/>
    </div>
  </html>`
  };
  return msg;
};

exports.sendEmail = async (payload) => {
  const msg = {
    from: EMAILS.from,
    ...payload
  };
  console.log(msg);
  try {
    await sendGridEmail.send(msg);
    console.log('Mail has been sent successfully');
  } catch (err) {
    console.log(`Mail Sent Error. Error Message is: ${err.message}`);
  }
};

exports.verifyAccountTemplate = verifyAccountTemplate;
exports.resetPasswordTemplate = resetPasswordTemplate;
