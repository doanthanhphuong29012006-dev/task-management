const express = require('express');
require('dotenv').config();
const database = require('./config/database');

database.connect();

const app = express();
const port = process.env.PORT;

const Route = require('./api/v1/routes/index.route');

Route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});