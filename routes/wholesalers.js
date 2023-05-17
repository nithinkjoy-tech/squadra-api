const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const mongoose = require("mongoose");
const {Wholesaler} = require("../models/wholesaler");
const {validateWholesaler} = require("../models/wholesaler.js");

router.get("/", async (req, res) => {
  let pageNo = Number(req?.query?.pageNo) || 1;
  let pageSize = Number(req?.query?.pageSize) || 4;
  let {firstName, lastName, email, phoneNumber, wholesalerId} =
    req.query;

  let wholesalers;
  wholesalers = await Wholesaler.aggregate([
    {
      $match: {
        firstName: {$regex: firstName || "", $options: "i"},
        lastName: {$regex: lastName || "", $options: "i"},
        email: {$regex: email || "", $options: "i"},
        phoneNumber: {$regex: phoneNumber || "", $options: "i"},
        wholesalerId: {$regex: wholesalerId || "",$options: "i"},
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

  if (wholesalers[0].data.length == 0)
    return res.send({
      content: [],
      pagesize: 0,
      pageno: 0,
      count: 0,
      totalPages: 0,
      domain: "Wholesalers",
    });

  let count = wholesalers[0].count[0].count;
  let response = {
    content: wholesalers[0].data,
    pagesize: pageSize,
    pageno: pageNo,
    count,
    totalPages: Math.ceil(count / pageSize),
    domain: "Wholesalers",
  };
  res.send(response);
});

router.post("/", [validate(validateWholesaler)], async (req, res) => {
  let existingWholesaler;
  existingWholesaler = await Wholesaler.findOne({email: req.body.email});
  if (existingWholesaler)
    return res.status(409).send({
      property: "email",
      message: "Wholesaler with given email ID already exist",
    });

  existingWholesaler = await Wholesaler.findOne({phoneNumber: req.body.phoneNumber});
  if (existingWholesaler)
    return res.status(409).send({
      property: "phoneNumber",
      message: "Wholesaler with given phone Number already exist",
    });

  wholesaler = new Wholesaler(req.body);
  await wholesaler.save();
  res.send(wholesaler);
});

router.put("/:id", [validate(validateWholesaler)], async (req, res) => {
  let wholesaler;
  let wholesalerId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(wholesalerId))
    return res.status(400).send("Invalid ID");
  wholesaler = await Wholesaler.findById(wholesalerId);

  if (wholesaler) {
    const {email, phoneNumber} = req.body;
    const existingWholesaler = await Wholesaler.findOne({
      $or: [{email}, {phoneNumber}],
    })
      .where("_id")
      .ne(wholesalerId)
      .select({
        email: 1,
        phoneNumber: 1,
      });

    if (existingWholesaler) {
      if (existingWholesaler.email === email) {
        return res.status(409).send({
          property: "email",
          message: "Wholesaler with the given email ID already exists",
        });
      }

      if (existingWholesaler.phoneNumber === phoneNumber) {
        return res.status(409).send({
          property: "phoneNumber",
          message: "Wholesaler with the given phone number already exists",
        });
      }
    }
    let updated = await wholesaler.set(req.body).save();
    res.send(updated);
  } else {
    res.status(404).send("Wholesaler with given ID not found");
  }
});

router.delete("/:id", async (req, res) => {
  let wholesalerId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(wholesalerId))
    return res.status(400).send("Invalid ID");
  const deletedWholesaler = await Wholesaler.findByIdAndRemove(wholesalerId);
  if (!deletedWholesaler) res.status(404).send("Wholesaler with given ID does not exist");
  res.send(deletedWholesaler);
});

module.exports = router;
