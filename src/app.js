require('dotenv').config();

const express = require('express');

const app = express();

app.use(express.json());

// TODO: mount your API router here

// TODO: mount your error handlers here

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
