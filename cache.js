const Memcached = require("memcached");
const { MEMCACHED_LOCATION } = require("./config");

const memcached = new Memcached(MEMCACHED_LOCATION, {
  timeout: 200,
  failures: 1,
  retries: 0,
});

module.exports = (lifetime) => {
  return (req, res, next) => {
    const key = `__cell__${req.originalUrl || req.url}`;
    memcached.get(key, (err, cachedData) => {
      if (err) {
        console.log(err);
      }
      if (cachedData) {
        res.send(cachedData);
      } else {
        res.sendResponse = res.send;
        res.send = (data) => {
          memcached.set(key, data, lifetime, (err, result) => {
            if (err) {
              console.log(err);
            }
          });
          res.sendResponse(data);
        };
        next();
      }
    });
  };
};
