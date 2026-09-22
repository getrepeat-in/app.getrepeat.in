import axios from 'axios';
const options = { amount: 50000, currency: "INR" };
const token = "dummy";
const mode = "test";
const url = `https://api.razorpay.com/v1/orders?mode=${mode}`;
console.log(url);
