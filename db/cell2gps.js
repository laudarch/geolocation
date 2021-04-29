const db = require("./connection");
const TABLE_NAME = 'cell2gps';

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
        data TEXT, 
        INDEX index_mcc_mnc_lac_cid (mcc, mnc, lac, cid))`
  );
};

const get = (mcc, mnc, lac, cid) => {
  return db.query(
    `SELECT * FROM ${TABLE_NAME} WHERE mcc = ? AND mnc = ? AND lac = ? AND cid = ?`,
    [mcc, mnc, lac, cid]
  );
};

const set = (mcc, mnc, lac, cid, data) => {
  return db.query(
    `INSERT INTO ${TABLE_NAME} (mcc, mnc, lac, cid, data) VALUES (?, ?, ?, ?, ?)`,
    [mcc, mnc, lac, cid, data]
  );
};

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
  set: (mcc, mnc, lac, cid, data) =>
    new Promise(async (resolve, reject) => {
      try {
        await db.connect();
        await set(mcc, mnc, lac, cid, data);
      } catch (error) {
        console.log(error);
      }
      resolve();
    }),
};
