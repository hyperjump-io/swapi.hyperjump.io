import express from "express";
import { decorateApp } from "@awaitjs/express";
import cors from "cors";
import morgan from "morgan";


const app = decorateApp(express());

const corsOptions = {
  origin: true,
  maxAge: 3600,
  methods: ["HEAD", "GET"],
  allowedHeaders: ["cache-control", "last-modified"],
  exposedHeaders: ["allow", "if-modified-since", "link", "location", "cache-control"]
};
app.use(cors(corsOptions));
app.use(morgan("combined"));

const conneg = (types) => (req, res, next) => {
  const contentType = req.accepts(types);
  if (contentType) {
    res.set("Content-Type", contentType);
    next();
  } else {
    res.status(406).end();
  }
};

app.use("*", conneg(["application/reference+json", "application/json"]));

// Handle paging
app.use("*", (req, res, next) => {
  if ("page" in req.query) {
    req.url = req.url.replace("?", ":");
    next("route");
  } else {
    next();
  }
});

const year = 31536000000;
app.use(express.static("data", {
  extensions: ["json"],
  immutable: true,
  index: "index.json",
  lastModified: true,
  maxAge: year
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  /* eslint-disable-next-line no-console */
  console.log(`swapi.hyperjump.io listening on port ${port}`);
});
