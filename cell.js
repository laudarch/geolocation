const mylnikov = require("./providers/mylnikov");
const yandex = require("./providers/yandex");
const opencellid = require("./providers/opencellid");
const cell2gps = require("./providers/cell2gps");
const clfDb = require("./db/clf");
const opencellidCsvDb = require("./db/opencellid_csv");
const cell2gpsDb = require("./db/cell2gps");
const Geolocation = require("./providers/geolocation");

module.exports = async (mcc, mnc, lac, cid) => {
  return (
    await Promise.all([
      mylnikov(mcc, mnc, lac, cid, true),
      mylnikov(mcc, mnc, lac, cid, false),
      yandex(mcc, mnc, lac, cid),
      opencellid(mcc, mnc, lac, cid),
      getOpencellidFromDb(mcc, mnc, lac, cid),
      getClfFromDb(mcc, mnc, lac, cid),
      getCell2gpsFromCache(mcc, mnc, lac, cid),
    ])
  ).filter((o) => o);
};

const getClfFromDb = async (mcc, mnc, lac, cid) => {
  let rows = await clfDb.get(mcc, mnc, lac, cid);
  if (rows.length) {
    let row = rows[0];
    return new Geolocation("clf_db", row.lat, row.lon, 0, row.address);
  }
  return null;
};

const getOpencellidFromDb = async (mcc, mnc, lac, cid) => {
  let rows = await opencellidCsvDb.get(mcc, mnc, lac, cid);
  if (rows.length) {
    let row = rows[0];
    return new Geolocation("opencellid_db", row.lat, row.lon, row._range);
  } else {
    return null;
  }
};

const getCell2gpsFromCache = async (mcc, mnc, lac, cid) => {
  let rows = await cell2gpsDb.get(mcc, mnc, lac, cid);

  let data;
  if (rows.length) {
    let row = rows[0];
    data = row.data ? JSON.parse(rows[0].data) : null;
  } else {
    data = await cell2gps(mcc, mnc, lac, cid);

    await cell2gpsDb.set(
      mcc,
      mnc,
      lac,
      cid,
      data ? JSON.stringify(data) : null
    );
  }
  return data;
};
