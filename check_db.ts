
import mongoose from "mongoose";
import { IndividualProfile, User } from "./server/models";

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/prodizzy");
  
  const individuals = await IndividualProfile.find({}).lean();
  console.log("Total Individual Profiles:", individuals.length);
  individuals.forEach(p => {
    console.log(`- ${p.full_name} (${p.email}), Roles: ${JSON.stringify(p.roles)}`);
  });

  const users = await User.find({}).lean();
  console.log("\nTotal Users:", users.length);
  users.forEach(u => {
    console.log(`- ${u.displayName || u.email}, ProfileType: ${u.profileType}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
