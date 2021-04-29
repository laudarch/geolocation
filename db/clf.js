const fs = require("fs");
const db = require("./connection");
const TABLE_NAME = 'clf';

const dropTable = () => {
  return db.query(`DROP TABLE IF EXISTS ${TABLE_NAME}`);
};

const createTable = () => {
  return db.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        mcc INT NOT NULL, 
        mnc INT NOT NULL, 
        lac INT NOT NULL, 
        cid INT NOT NULL, 
        lat FLOAT, 
        lon FLOAT, 
        address TEXT, 
        INDEX index_mcc_mnc_lac_cid (mcc, mnc, lac, cid))`
  );
};

/**
 * Clf v3.0 file
 */
const populateTable = (filename) => {
  return db.query({
    sql: `LOAD DATA LOCAL 
      INFILE '${filename}' 
      INTO TABLE ${TABLE_NAME} 
      FIELDS TERMINATED BY ';' 
      LINES TERMINATED BY '\n' 
      (@var1, @var2, @var3, @dummy, lat, lon, @dummy, @var6, @dummy) 
      SET mcc = SUBSTRING(@var1, 1, 3), 
      mnc = SUBSTRING(@var1, 4), 
      lac = CONV(SUBSTRING(@var3, 3), 16, 10), 
      cid = CONV(SUBSTRING(@var2, 3), 16, 10), 
      address = NULLIF(@var6, '')`,
    values: [],
    infileStreamFactory: () => fs.createReadStream(filename),
  });
};

const get = (mcc, mnc, lac, cid) => {
  return db.query(
    `SELECT * FROM ${TABLE_NAME} WHERE mcc = ? AND mnc = ? AND lac = ? AND cid = ?`,
    [mcc, mnc, lac, cid]
  );
};

const importClf = async (filename) => {
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

// importClf("unite_v30.clf");

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
