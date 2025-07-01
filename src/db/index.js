import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//connecting DB takes time so thats why async
const connectDB = async () => {
     try {
          //wait for mongoose to connect
          const x = await mongoose.connect(
               `${process.env.MONGODB_URL}/${DB_NAME}`
          );
          console.log(`Connected Successfully`);
          //below is for because there are many host on production level
          console.log(x.connection.host);
     } catch (error) {
          console.log(`Error : ${error}`);
          process.exit(1);
     }
};

export default connectDB;
