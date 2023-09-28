/* eslint-disable no-console */
import { writeFile, mkdir, rm } from "node:fs/promises";
import { dirname } from "node:path";


const toHref = (uri) => {
  if (uri === null) {
    return null;
  }

  uri = new URL(uri);
  return { "$href": uri.pathname.replace(/\/$/, "") + uri.search };
};

const clean = (value) => {
  if (typeof value !== "object" || Array.isArray(value) || value === null) {
    return value;
  }

  delete value.url;

  const cleanObj = {};
  Object.entries(value).forEach(([key, value]) => {
    if (value !== null) {
      cleanObj[key] = value;
    }
  });

  return cleanObj;
};

const transform = async (uri, type, subType) => {
  console.log(uri);
  const response = await fetch(`https://swapi.dev${uri}`);
  const data = await response.json();
  const jref = clean(await transformer[type](data, subType));
  await writeFile(`./data${uri.replace(/\/api$/, "/api/index").replace("?", ":")}.json`, JSON.stringify(jref, null, 2));
};

const transformer = {
  api: async (api) => {
    const jref = {
      people: toHref(api.people),
      planets: toHref(api.planets),
      films: toHref(api.films),
      species: toHref(api.species),
      vehicles: toHref(api.vehicles),
      starships: toHref(api.starships)
    };

    for (const type in jref) {
      await mkdir(`./data/api/${type}`, { recursive: true });
      const firstPage = toHref(api[type] + "?page=1");
      await writeFile(`./data/api/${type}/index.json`, JSON.stringify(firstPage, null, 2));

      await transform(firstPage.$href, "list", type);
    }

    return jref;
  },
  list: async (list, type) => {
    const jref = {
      ...list,
      next: toHref(list.next),
      previous: toHref(list.previous),
      results: list.results.map((item) => toHref(item.url))
    };

    for (const item of jref.results) {
      await transform(item.$href, type);
    }

    if (jref.next) {
      await transform(jref.next.$href, "list", type);
    }

    return jref;
  },
  people: (person) => ({
    ...person,
    homeworld: toHref(person.homeworld),
    films: person.films.map(toHref),
    species: person.species.map(toHref),
    vehicles: person.vehicles.map(toHref),
    starships: person.starships.map(toHref)
  }),
  planets: (planet) => ({
    ...planet,
    residents: planet.residents.map(toHref),
    films: planet.films.map(toHref)
  }),
  films: (film) => ({
    ...film,
    characters: film.characters.map(toHref),
    planets: film.planets.map(toHref),
    starships: film.starships.map(toHref),
    vehicles: film.vehicles.map(toHref),
    species: film.species.map(toHref)
  }),
  species: (species) => ({
    ...species,
    homeworld: toHref(species.homeworld),
    people: species.people.map(toHref),
    films: species.films.map(toHref)
  }),
  vehicles: (vehicle) => ({
    ...vehicle,
    pilots: vehicle.pilots.map(toHref),
    films: vehicle.films.map(toHref)
  }),
  starships: (starship) => ({
    ...starship,
    pilots: starship.pilots.map(toHref),
    films: starship.films.map(toHref)
  })
};

(async function () {
  try {
    await rm("./data", { recursive: true, force: true });
    await transform("/api", "api");

    console.log("done");
  } catch (error) {
    console.log(error);
  }
}());
