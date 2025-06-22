import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGOBD_URI);
    console.log("Connected to MongoDB:" + connection.connection.host);
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`);
  }
};
