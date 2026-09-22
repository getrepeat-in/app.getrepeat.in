import mongoose from 'mongoose';
import { decrypt, encrypt } from './src/lib/crypto/index.js';
import axios from 'axios';

mongoose.connect("mongodb+srv://ajitkushwaha3101:snehavats1404@getrepeat.xjlqc6e.mongodb.net/?appName=getrepeat/development").then(async () => {
  const db = mongoose.connection.db;
  const integration = await db.collection("integrations").findOne({ restaurantId: new mongoose.Types.ObjectId("6aabc308ab1ee442d4985a79") });
  const refreshToken = decrypt(integration.razorpay.refreshToken);
  
  try {
    const res = await axios.post("https://auth.razorpay.com/token", {
        client_id: "Tf0UIz9HfdC6EQ",
        client_secret: "kbpw9R6K6Eem1f2MfyaZ85CS",
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }, {
        headers: { "Content-Type": "application/json" }
    });
    
    const newToken = res.data.access_token;
    
    // Try to create order WITHOUT mode=test
    try {
      const orderRes = await axios.post("https://api.razorpay.com/v1/orders", { amount: 50000, currency: "INR" }, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      console.log("Order success NO MODE:", orderRes.data);
    } catch (e) {
      console.log("Order fail NO MODE:", e.response?.data);
    }

  } catch (e) {
    console.log("Refresh fail:", e.response?.data);
  }
  process.exit();
});
