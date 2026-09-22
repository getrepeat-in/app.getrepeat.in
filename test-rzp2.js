import mongoose from 'mongoose';
import axios from 'axios';

mongoose.connect("mongodb+srv://ajitkushwaha3101:snehavats1404@getrepeat.xjlqc6e.mongodb.net/?appName=getrepeat/development").then(async () => {
  const db = mongoose.connection.db;
  const integration = await db.collection("integrations").findOne({ restaurantId: new mongoose.Types.ObjectId("6aabc308ab1ee442d4985a79") });
  const accountId = integration.razorpay.accountId;
  const clientId = "Tf0UIz9HfdC6EQ";
  const clientSecret = "kbpw9R6K6Eem1f2MfyaZ85CS";
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const res = await axios.post("https://api.razorpay.com/v1/orders", { amount: 50000, currency: "INR" }, {
      headers: { 
        Authorization: `Basic ${auth}`,
        "X-Razorpay-Account": accountId
      }
    });
    console.log("Basic auth success:", res.data);
  } catch (e) {
    console.log("Basic auth fail:", e.response?.data);
  }

  process.exit();
});
