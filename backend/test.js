import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_SECRET);
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

instance.payments.fetch('pay_RVsvdNywaDV83t')
  .then(payment => console.log(payment))
  .catch(err => console.log(err));
