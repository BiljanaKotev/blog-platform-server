const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.json('All good in here');
});

router.post('/send-email', (req, res, next) => {
  let { email } = req.body;

  // Send an email with the information we got from the form
  transporter
    .sendMail({
      from: `"My Awesome Project " <${process.env.EMAIL_ADDRESS}>`,
      to: email,
    })
    .then((info) => res.render('message', { email }))
    .catch((error) => console.log(error));
});

module.exports = router;

