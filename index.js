const express=require("express");
const app= express();

require("dotenv").config();
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();

let port=3500||process.env.port

app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
})