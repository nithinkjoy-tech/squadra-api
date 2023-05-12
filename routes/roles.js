const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const mongoose = require("mongoose");
const {Role} = require("../models/role");
const {validateRole} = require("../models/role.js");

router.get("/", async (req, res) => {
  let pageNo = Number(req?.query?.pageNo) || 1;
  let pageSize = Number(req?.query?.pageSize) || 4;
  let {roleName, organizationName, createdDate, roleState, roleId} = req.query;
  let roles;
  roles = await Role.aggregate([
    {
      $match: {
        roleName: {$regex: roleName || "", $options: "i"},
        organizationName: {$regex: organizationName || "", $options: "i"},
        createdDate: {$regex: createdDate || ""},
        roleState: {$regex: roleState || ""},
        roleId: {$regex: roleId || "", $options: "i"},
      },
    },
    {
      $facet: {
        data: [
          {$sort: {_id: -1}},
          {$skip: (pageNo - 1) * pageSize},
          {$limit: pageSize},
        ],
        count: [{$count: "count"}],
      },
    },
  ]);

  if (roles[0].data.length == 0)
    return res.send({
      content: [],
      pagesize: 0,
      pageno: 0,
      count: 0,
      totalPages: 0,
      domain: "Roles",
    });

  let count = roles[0].count[0].count;
  let response = {
    content: roles[0].data,
    pagesize: pageSize,
    pageno: pageNo,
    count,
    totalPages: Math.ceil(count / pageSize),
    domain: "Roles",
  };
  res.send(response);
});

router.post("/", [validate(validateRole)], async (req, res) => {
  let role = new Role(req.body);
  await role.save();
  res.send(role);
});

router.put("/:id", [validate(validateRole)], async (req, res) => {
  let role;
  let roleId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(roleId))
    return res.status(400).send("Invalid ID");
  role = await Role.findById(roleId);

  if (role) {
    let updated = await role.set(req.body).save();
    res.send(updated);
  } else {
    res.status(404).send("Role with given ID not found");
  }
});

router.delete("/:id", async (req, res) => {
  let roleId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(roleId))
    return res.status(400).send("Invalid ID");
  const deletedRole = await Role.findByIdAndRemove(roleId);
  if (!deletedRole) res.status(404).send("Role with given ID does not exist");
  res.send(deletedRole);
});

module.exports = router;
