const express=require('express')
const users=require("../routes/users");
const companies=require("../routes/companies");

module.exports = function (app) {
    app.use(express.json());
    app.use("/api/users", users);
    app.use("/api/companies", companies);
}