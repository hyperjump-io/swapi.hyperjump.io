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

const filename = (req) => {
  const originalUrl = req.originalUrl;
  const url = originalUrl[originalUrl.length - 1] === "/" ? originalUrl.slice(0, -1) : originalUrl;
  return `${__dirname}/data${url}.json`;
};

const cache = async (req, res, next) => {
  const resource = JSON.parse(await fs.readFile(filename(req), "utf8"));
  const lastModified = new Date(resource.edited);

  if (req.headers["if-modified-since"] && new Date(req.headers["if-modified-since"]) > lastModified) {
    res.status(304).end();
  } else {
    res.set("Last-Modified", lastModified.toUTCString());
    next();
  }
};

app.use("*", conneg(["application/reference+json", "application/json"]));
app.useAsync("*", cache);

const year = 31536000000;
app.get("*", (req, res) => {
  res.sendFile(filename(req), { maxAge: year, immutable: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`swapi.hyperjump.io listening on port ${port}`));
