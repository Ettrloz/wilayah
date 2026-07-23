import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const file = path.resolve(cwd, "./db/wilayah.sql");
const content = readFileSync(file, "utf8");

const REGEX = /^\('(\d{2})(?:\.(\d{2}))?(?:\.(\d{2}))?(?:\.(\d{4}))?','(.*)'\)/;

const provinces = [];
const regencies = [];
const districts = [];
const villages = [];

for (const line of content.split("\n")) {
  const match = line.match(REGEX);

  if (!match) continue;

  const [, province, regency, district, village, name] = match;

  if (!regency) {
    provinces.push({
      id: Number(province),
      name,
    });

    continue;
  }

  if (!district) {
    regencies.push({
      id: Number(regency),
      province: Number(province),
      name,
    });

    continue;
  }

  if (!village) {
    districts.push({
      id: Number(district),
      province: Number(province),
      regency: Number(regency),
      name,
    });

    continue;
  }

  villages.push({
    id: Number(village),
    province: Number(province),
    regency: Number(regency),
    district: Number(district),
    name,
  });
}

mkdirSync(path.resolve(cwd, "./static/api/provinces"), {
  recursive: true,
});

writeFileSync(
  path.resolve(cwd, "./static/api/provinces/provinces.json"),
  JSON.stringify(provinces, null, 2),
);

writeGrouped("regencies", regencies, (item) => `${item.province}`);

writeGrouped(
  "districts",
  districts,
  (item) => `${item.province}${pad(item.regency)}`,
);

writeGrouped(
  "villages",
  villages,
  (item) => `${item.province}${pad(item.regency)}${pad(item.district)}`,
);

/**
 * @template T
 * @param {string} folder
 * @param {T[]} items
 * @param {(item:T)=>string} getKey
 */
function writeGrouped(folder, items, getKey) {
  const dir = path.resolve(cwd, "./static/api", folder);

  mkdirSync(dir, {
    recursive: true,
  });

  /** @type {Record<string, T[]>} */
  const groups = {};

  for (const item of items) {
    const key = getKey(item);

    (groups[key] ??= []).push(item);
  }

  for (const [key, values] of Object.entries(groups)) {
    writeFileSync(
      path.resolve(dir, `${key}.json`),
      JSON.stringify(values, null, 2),
    );
  }
}

/**
 * @param {number} value
 */
function pad(value) {
  return value.toString().padStart(2, "0");
}
