import mongoose from 'mongoose';
import { decrypt } from './src/lib/crypto/index.js';
import axios from 'axios';

mongoose.connect("mongodb+srv://ajitkushwaha3101:snehavats1404@getrepeat.xjlqc6e.mongodb.net/?appName=getrepeat/development").then(async () => {
  const db = mongoose.connection.db;
  const integration = await db.collection("integrations").findOne({ restaurantId: new mongoose.Types.ObjectId("6aabc308ab1ee442d4985a79") });
  const encrypted = integration.razorpay.accessToken;
  const token = decrypt(encrypted);
  
  try {
    const res = await axios.post("https://api.razorpay.com/v1/orders?mode=live", { amount: 50000, currency: "INR" }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("mode=live success:", res.data);
  } catch (e) {
    console.log("mode=live fail:", e.response?.data);
  }

  process.exit();
});
