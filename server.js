//simple backend express server which hosts production build version of slzgui, to test locally go to http://localhost:3000
require("dotenv").config(); // import env
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const guiBuild = path.join(__dirname, "build");
const routes = require("./express-routes/routes");

app.use(express.static(guiBuild));
app.use(bodyParser.json());

// create a GET route
app.get("/express_backend", (req, res) => {
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO CRAIG" });
});

app.use("/api", routes);

app.get("*", (req, res) => {
  res.sendFile(path.join(guiBuild, "index.html"));
});

// This displays message that the server running and listening to specified port
if (process.env.PRE_COMMIT !== "true")
  app.listen(port, () => console.log(`Listening on port ${port}`));
