import dbConnect from "./src/lib/db.js";
import MenuItem from "./src/models/Item.js";
import mongoose from "mongoose";

async function test() {
  await dbConnect();
  const itemId = "6ab12816a7e6fcdd341482d8";
  
  const item = await MenuItem.findById(itemId);
  console.log("Before:", item.name);
  
  const updatedItem = await MenuItem.findOneAndUpdate(
    { _id: itemId },
    { $set: { name: item.name + " Test" } },
    { new: true, runValidators: true }
  );
  
  console.log("After:", updatedItem.name);
  
  await MenuItem.findOneAndUpdate(
    { _id: itemId },
    { $set: { name: item.name } },
    { new: true, runValidators: true }
  );
  
  console.log("Reverted:", item.name);
  process.exit(0);
}
test();
