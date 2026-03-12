
const mongoose = require("mongoose");
const { Schema } = mongoose;

async function check() {
  const uri = "mongodb+srv://prodizzy:prodizzylaunch2026@prodizzy0.fwtxct9.mongodb.net/?appName=Prodizzy0";
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  
  const IndividualProfile = mongoose.model("IndividualProfile", new Schema({}, { strict: false }));
  const User = mongoose.model("User", new Schema({}, { strict: false }));

  const individuals = await IndividualProfile.find({}).lean();
  console.log("Total Individual Profiles:", individuals.length);
  individuals.forEach(p => {
    console.log(`- ${p.full_name || p.email} (${p.email}), Roles: ${JSON.stringify(p.roles)}`);
  });

  const users = await User.find({}).lean();
  console.log("\nTotal Users:", users.length);
  users.forEach(u => {
    console.log(`- ${u.displayName || u.email}, ProfileType: ${u.profileType}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
