const express=require('express')
const users=require("../routes/users");
const roles=require("../routes/roles");
const companies=require("../routes/companies");
const wholesalers=require("../routes/wholesalers");

module.exports = function (app) {
    app.use(express.json());
    app.use("/api/users", users);
    app.use("/api/roles", roles);
    app.use("/api/companies", companies);
    app.use("/api/wholesalers", wholesalers);
}