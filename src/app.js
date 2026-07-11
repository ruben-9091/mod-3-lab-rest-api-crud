require("dotenv").config();
require("./lib/db");

const express = require("express");
const apiRouter = require("./controllers");
const { errors } = require("./middlewares");

const app = express();

app.use(express.json());

app.use("/api/v1", apiRouter);
app.use(errors.notFound);
app.use(errors.globalHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
