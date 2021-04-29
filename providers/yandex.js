const axios = require("axios");
const Geolocation = require("./geolocation")
const { YANDEX_API_KEY } = require("../config");

module.exports = async (mcc, mnc, lac, cid) => {
  const json = {
    common: {
      version: "1.0",
      api_key: YANDEX_API_KEY,
    },
    gsm_cells: [
      {
        countrycode: mcc,
        operatorid: mnc,
        lac,
        cellid: cid,
      },
    ],
  };
  const params = new URLSearchParams();
  params.append("json", JSON.stringify(json));
  try {
    const res = await axios.post(
      "http://api.lbs.yandex.net/geolocation",
      params
    );
    if ("gsm" == res.data.position.type) {
      return new Geolocation(
        "yandex",
        res.data.position.latitude,
        res.data.position.longitude,
        res.data.position.precision
      );
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};
