import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('Already connected to database');
    return;
  }
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URL || '', {});
    connection.isConnected = dbConnection.connections[0].readyState;
    console.log('DB connected Successfully');
  } catch (error) {
    console.log('Database connection Faild: ', error);
    process.exit(1);
  }
}

export default dbConnect;