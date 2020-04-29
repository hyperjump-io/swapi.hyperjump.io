# Hyperjump Star Wars API

The Hyperjump Star Wars API is a demo API for the [JSON Reference](jref) (JRef)
media type and the [Hyperjump browser](hyperjump). The API is based on the [Star
Wars API](swapi) (SWAPI) with JSON converted to JRef.

You can explore the with the Hyperjump Explorer (https://explore.hyperjump.io/#https://swapi.hyperjump.io/api/films/1).

## Generation

The `bin/convert` script crawls the original Star Wars API and converts each
response from JSON to JRef. All of the data is stored as files in the `data`
folder.

## Deployment

The app is deployed to Heroku. The site is served through Cloudflare.
TODO: Automate deployment

[jref]: https://github.com/hyperjump-io/browser/blob/master/lib/json-reference/README.md
[hyperjump]: https://github.com/hyperjump-io/browser
[swapi]: https://www.swapi.co
