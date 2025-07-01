import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
dotenv.config();

//connect db is asynchronous so it returns a promise
//we cannot use try catch here, because connect DB itself uses try catch
connectDB()
     .then(() => {
          //now we will start listen
          app.on("error", (e) => {
               console.log("ERROR", e);
          });
          app.listen(process.env.PORT || 3000, () => {
               console.log(` ⚙ LISTENING TO PORT ${process.env.PORT}`);
          });
     })
     .catch((error) => {
          console.log("DB CONNECTION ERROR");
     });
