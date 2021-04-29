const express = require("express");
const { query, validationResult } = require("express-validator");
const cache = require("./cache");
const cell = require("./cell");

const router = express.Router();

router.get(
  "/api/v1",
  [
    query("mcc").isInt({ min: 0, max: 999 }),
    query("mnc").isInt({ min: 0, max: 32767 }),
    query("lac").isInt({ min: 0, max: 65535 }),
    query("cid").isInt({ min: 0, max: 68719476735 }),
  ],
  cache(60 * 60 * 24),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.sendStatus(400);
    }
    const mcc = parseInt(req.query.mcc);
    const mnc = parseInt(req.query.mnc);
    const lac = parseInt(req.query.lac);
    const cid = parseInt(req.query.cid);
    let data = await cell(mcc, mnc, lac, cid);
    res.json(data);
  }
);

module.exports = router;
