require("dotenv").config({ path: __dirname + "/.env" });
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

// Here we can add our routes
app.get("/", (req, res) => {
  res.send("Hello World!");
} );

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
} );

app.get('/users', getUsers)