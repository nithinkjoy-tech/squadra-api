const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const mongoose = require("mongoose");
const {Company} = require("../models/company");
const {validateCompany} = require("../models/company.js");

router.get("/", async (req, res) => {
  let pageNo = Number(req?.query?.pageNo) || 1;
  let pageSize = Number(req?.query?.pageSize) || 4;
  let {companyName, companyEmail, validTill, organizationName, companyId} =
    req.query;
  let companies;
  companies = await Company.aggregate([
    {
      $match: {
        companyName: {$regex: companyName || "", $options: "i"},
        companyEmail: {$regex: companyEmail || "", $options: "i"},
        validTill: {$regex: validTill || ""},
        organizationName: {$regex: organizationName || "", $options: "i"},
        companyId: {$regex: companyId || "", $options: "i"},
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

  if (companies[0].data.length == 0)
    return res.send({
      content: [],
      pagesize: 0,
      pageno: 0,
      count: 0,
      totalPages: 0,
      domain: "Companies",
    });

  let count = companies[0].count[0].count;
  let response = {
    content: companies[0].data,
    pagesize: pageSize,
    pageno: pageNo,
    count,
    totalPages: Math.ceil(count / pageSize),
    domain: "Companies",
  };
  res.send(response);
});

router.post("/", [validate(validateCompany)], async (req, res) => {
  let existingCompany;
  existingCompany = await Company.findOne({
    companyEmail: req.body.companyEmail,
  });

  if (existingCompany)
    return res.status(409).send({
      property: "companyEmail",
      message: "Company with given email ID already exist",
    });

  let company = new Company(req.body);
  await company.save();
  res.send(company);
});

router.put("/:id", [validate(validateCompany)], async (req, res) => {
  let company;
  let companyId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(companyId))
    return res.status(400).send("Invalid ID");
  company = await Company.findById(companyId);

  if (company) {
    const {companyEmail} = req.body;
    const existingCompany = await Company.findOne({companyEmail})
      .where("_id")
      .ne(companyId)
      .select({
        companyEmail: 1,
      });

    if (existingCompany) {
      if (existingCompany.companyEmail === companyEmail) {
        return res.status(409).send({
          property: "companyEmail",
          message: "Company with the given email ID already exists",
        });
      }
    }
    let updated = await company.set(req.body).save();
    res.send(updated);
  } else {
    res.status(404).send("Company with given ID not found");
  }
});

router.delete("/:id", async (req, res) => {
  let companyId = req?.params?.id;
  if (!mongoose.Types.ObjectId.isValid(companyId))
    return res.status(400).send("Invalid ID");

  const deletedCompany = await Company.findByIdAndRemove(companyId);
  if (!deletedCompany)
    res.status(404).send("Company with given ID does not exist");
  res.send(deletedCompany);
});

module.exports = router;
