const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const mongoose = require("mongoose");
const {User} = require("../models/user");
const {validateUser} = require("../models/user.js");

router.get("/", async (req, res) => {
  let pageNo = Number(req?.query?.pageNo) || 1;
  let pageSize = Number(req?.query?.pageSize) || 4;
  let {firstName, lastName, email, phoneNumber, companyName, userState} =
    req.query;

  let users;
  users = await User.aggregate([
    {
      $match: {
        firstName: {$regex: firstName || "", $options: "i"},
        lastName: {$regex: lastName || "", $options: "i"},
        email: {$regex: email || "", $options: "i"},
        phoneNumber: {$regex: phoneNumber || "", $options: "i"},
        companyName: {$regex: companyName || "", $options: "i"},
        userState: {$regex: userState || ""},
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

  if (users[0].data.length == 0)
    return res.send({
      content: [],
      pagesize: 0,
      pageno: 0,
      count: 0,
      totalPages: 0,
      domain: "Users",
    });

  let count = users[0].count[0].count;
  let response = {
    content: users[0].data,
    pagesize: pageSize,
    pageno: pageNo,
    count,
    totalPages: Math.ceil(count / pageSize),
    domain: "Users",
  };
  res.send(response);
});

router.post("/", [validate(validateUser)], async (req, res) => {
  let existingUser;
  existingUser = await User.findOne({email: req.body.email});
  if (existingUser)
    return res.status(409).send({
      property: "email",
      message: "User with given email ID already exist",
    });

  existingUser = await User.findOne({phoneNumber: req.body.phoneNumber});
  if (existingUser)
    return res.status(409).send({
      property: "phoneNumber",
      message: "User with given phone Number already exist",
    });

  user = new User(req.body);
  await user.save();
  res.send(user);
});

router.put("/:id", [validate(validateUser)], async (req, res) => {
  let user;
  let userId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).send("Invalid ID");
  user = await User.findById(userId);

  if (user) {
    const {email, phoneNumber} = req.body;
    const existingUser = await User.findOne({
      $or: [{email}, {phoneNumber}],
    })
      .where("_id")
      .ne(userId)
      .select({
        email: 1,
        phoneNumber: 1,
      });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).send({
          property: "email",
          message: "User with the given email ID already exists",
        });
      }

      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(409).send({
          property: "phoneNumber",
          message: "User with the given phone number already exists",
        });
      }
    }
    let updated = await user.set(req.body).save();
    res.send(updated);
  } else {
    res.status(404).send("User with given ID not found");
  }
});

router.delete("/:id", async (req, res) => {
  let userId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).send("Invalid ID");
  const deletedUser = await User.findByIdAndRemove(userId);
  if (!deletedUser) res.status(404).send("User with given ID does not exist");
  res.send(deletedUser);
});

module.exports = router;
