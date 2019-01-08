const fs = require("fs").promises;
const express = require("express");
const { decorateApp } = require("@awaitjs/express");
const cors = require("cors");
const morgan = require("morgan");


const app = decorateApp(express());

const corsOptions = {
  origin: true,
  maxAge: 3600,
  methods: ["HEAD", "GET"]
};
app.use(cors(corsOptions));

app.use(morgan("combined"));

const conneg = (types) => (req, res, next) => {
  const contentType = req.accepts(types);
  if (!contentType) {
    res.status(406).end();
  } else {
    res.set("Content-Type", contentType);
    next();
  }
};

const cache = async (req, res, next) => {
  const resource = JSON.parse(await fs.readFile(`${__dirname}/${req.baseUrl}.json`, "utf8"));
  const lastModified = new Date(resource.edited);

  if (req.headers["if-modified-since"] && new Date(req.headers["if-modified-since"]) > lastModified) {
    res.status(304).end();
  } else {
    res.set("Last-Modified", lastModified.toUTCString());
    next();
  }
};

app.use("/api/*", conneg(["application/reference+json", "application/json"]));
app.useAsync("/api/*", cache);

const year = 31536000000;
app.get("/api/*", (req, res) => {
  res.sendFile(`${__dirname}/${req.path}.json`, { maxAge: year });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`starwars.hyperjump.io listening on port ${port}`));
