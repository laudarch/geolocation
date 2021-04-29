const axios = require("axios");
const Geolocation = require("./geolocation");
const { OPENCELLID_TOKEN } = require("../config");
const e = require("express");

module.exports = async (mcc, mnc, lac, cid) => {
  const json = {
    token: OPENCELLID_TOKEN,
    mcc,
    mnc,
    cells: [{ lac, cid }],
    address: 1,
  };
  try {
    let res = await axios.post(
      "https://eu1.unwiredlabs.com/v2/process.php",
      json
    );
    if ("ok" == res.data.status) {
      return new Geolocation(
        "opencellid",
        res.data.lat,
        res.data.lon,
        res.data.accuracy,
        res.data.address
      );
    } else if (
      "error" == res.data.status &&
      "No matches found" == res.data.message
    ) {
    } else {
      console.log(res.data);
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};
