import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
}

console.log("Testing connection to:", uri.replace(/:([^@]+)@/, ":****@"));

(async () => {
    try {
        console.log("Attempting to connect...");
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        console.log("SUCCESS!");
        await mongoose.connection.close();
        process.exit(0);
    } catch (err: any) {
        console.error("FAILURE:", err.name, err.message);
        if (err.cause) {
            console.error("CAUSE:", err.cause);
        }
        process.exit(1);
    }
})();
