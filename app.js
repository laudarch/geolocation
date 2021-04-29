const express = require("express");
const cors = require("cors");
const compression = require("compression");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(compression());
app.use(routes);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
