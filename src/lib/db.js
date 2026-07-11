const mongoose = require("mongoose");
const config = require("./config");

mongoose
  .connect(config.get("db.uri"))
  .then(() => console.info("Connected successfully"))
  .catch((error) => {
    console.error("An error occurred while connecting to the database", error);
    process.exit(0);
  });
