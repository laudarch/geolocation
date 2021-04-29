const fs = require("fs");
const db = require("./connection");
const TABLE_NAME = 'opencellid';

const dropTable = () => {
  return db.query(`DROP TABLE IF EXISTS ${TABLE_NAME}`);
};

const createTable = () => {
  return db.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        radio TEXT, 
        mcc INT, 
        net INT, 
        area INT, 
        cell INT, 
        unit INT, 
        lon FLOAT, 
        lat FLOAT, 
        _range INT, 
        samples INT, 
        changeable INT, 
        created INT, 
        updated INT, 
        averageSignal INT, 
        INDEX index_mcc_net_area_cell (mcc, net, area, cell))`
  );
};

const populateTable = (filename) => {
  return db.query({
    sql: `LOAD DATA LOCAL 
      INFILE '${filename}' 
      INTO TABLE ${TABLE_NAME} 
      FIELDS TERMINATED BY ',' 
      LINES TERMINATED BY '\n' 
      IGNORE 1 ROWS 
      (radio, mcc, net, area, cell, unit, lon, lat, _range, samples, changeable, created, updated, averageSignal)`,
    values: [],
    infileStreamFactory: () => fs.createReadStream(filename),
  });
};

const get = (mcc, mnc, lac, cid) => {
  return db.query(
    `SELECT * FROM ${TABLE_NAME} WHERE mcc = ? AND net = ? AND area = ? AND cell = ?`,
    [mcc, mnc, lac, cid]
  );
};

const importCsv = async (filename) => {
  try {
    let res = await dropTable();
    console.log(res);

    res = await createTable();
    console.log(res);

    res = await populateTable(filename);
    console.log(res);

    let [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} LIMIT 1`);
    console.log(rows);
  } catch (error) {
    console.log(error);
  }
};

// importCsv("cell_towers.csv");

module.exports = {
  get: (mcc, mnc, lac, cid) =>
    new Promise(async (resolve, reject) => {
      try {
        await db.connect();
        let [rows] = await get(mcc, mnc, lac, cid);
        return resolve(rows);
      } catch (error) {
        console.log(error);
      }
      return resolve([]);
    }),
};
