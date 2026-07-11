require("dotenv").config();
const convict = require("convict");

const config = convict({
  port: {
    doc: "Port the server listens on",
    format: "port",
    default: 3000,
    env: "PORT",
  },
  db: {
    uri: {
      doc: "Mongo db connection URI",
      format: (val) => {
        if (!val) throw new Error("MONGODB_URI is mandatory");
      },
      default: null,
      env: "MONGODB_URI",
    },
  },
});

config.validate({ allowed: "strict" });

module.exports = config;
