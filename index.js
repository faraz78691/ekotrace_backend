const express = require("express");
const bodyParser = require("body-parser");
const purchaseGood = require("./routes/purchasedgood");
const upDownLease = require('./routes/upDownLease');
const business = require("./routes/businesstravel");
const wasteGenerated = require("./routes/wastegenerated");
const stationaryComb = require("./routes/stationaryCombustion");
const scope1 = require("./routes/scope1");
const scope2 = require("./routes/scope2");
const user = require("./routes/user");
const report = require("./routes/report");
const dashboard = require("./routes/dashboard");
const tree = require("./routes/tree");
const target = require("./routes/targetSetting");
const ghgEmissionReport = require("./routes/ghgEmissionReport");
const kpiReport = require("./routes/kpiReport");
const app = express();
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// Enable CORS for all domains, dynamic origin
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, origin || true);
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,auth" // 👈 Add custom headers here
};
// ✅ Must come before any route
app.use(cors(corsOptions));

// ✅ Preflight request handler (important!)
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
    limit: "100mb",
  })
);
app.use(express.static("public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// ✅ Define all your routes
app.use("/", purchaseGood);
app.use("/", upDownLease);
app.use("/", business);
app.use("/", wasteGenerated);
app.use("/", stationaryComb);
app.use("/", scope1);
app.use("/", scope2);
app.use("/", user);
app.use("/", dashboard);
app.use("/report", report);
app.use("/targetsetting", target);
app.use("/", tree);
app.use("/", ghgEmissionReport);
app.use("/", kpiReport);

// ✅ Optional static file route
app.use("/success", express.static(path.join(__dirname, "/controller/view/message.html")));

// ✅ Health check
app.get("/server", (req, res) => {
  return res.status(200).json({ message: "Eco Trace server is running" });
});

// ✅ Listen on port
const PORT = 4000;
app.listen(PORT, function () {
  console.log(`Node app is running on port ${PORT}`);
});

module.exports = app;
