const axios = require("axios");
const Geolocation = require("./geolocation")

module.exports = async (mcc, mnc, lac, cid, isOpenData) => {
  let params = {
    mcc,
    mnc,
    lac,
    cellid: cid,
    v: "1.1",
  };
  if (isOpenData) {
    params["data"] = "open";
  }
  try {
    let res = await axios.get("https://api.mylnikov.org/geolocation/cell", {
      params,
    });
    if (200 == res.data.result) {
      return new Geolocation(
        `mylnikov${isOpenData ? "_open" : ""}`,
        res.data.data.lat,
        res.data.data.lon,
        res.data.data.range
      );
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};
