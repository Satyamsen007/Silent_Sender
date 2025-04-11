import mongoose from "mongoose";

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    console.log('Already connected to database');
    return;
  }
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URL || '', {});
    connection.isConnected = dbConnection.connections[0].readyState;
    console.log('DB connected Successfully');
  } catch (error) {
    console.log('Database connection Failed: ', error);
    process.exit(1);
  }
}

export default dbConnect;