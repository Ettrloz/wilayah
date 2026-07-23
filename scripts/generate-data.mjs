import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const file = path.resolve(cwd, "./db/wilayah.sql");
const content = readFileSync(file, "utf-8");

const REGEX_ID =
  /^\(\'(\d{2})(?:\.(\d{2}))?(?:\.(\d{2}))?(?:\.(\d{4}))?\','(.*)'\)/;

/**
 * @typedef {Object} Province
 * @property {number} id
 * @property {string} name
 */

/** @type {Province[]} */
const provinces = [];

/**
 * @typedef {Object} Regency
 * @property {number} id
 * @property {number} fullId
 * @property {string} name
 */

/** @type {Regency[]} */
const regencies = [];

/**
 * @typedef {Object} District
 * @property {number} id
 * @property {number} fullId
 * @property {string} name
 */

/** @type {District[]} */
const districts = [];

/**
 * @typedef {Object} Village
 * @property {number} id
 * @property {number} fullId
 * @property {string} name
 */

/** @type {Village[]} */
const villages = [];

for (const line of content.split("\n")) {
  const match = line.match(REGEX_ID);

  if (!match) {
    continue;
  }

  const [, province, regency, district, village, name] = match;

  processData({
    province,
    regency,
    district,
    village,
    name,
  });
}

const processedData = {
  provinces,
  regencies,
  districts,
  villages,
};

for (const [type, items] of Object.entries(processedData)) {
  const dirPath = path.resolve(cwd, `./static/${type}/`);

  mkdirSync(dirPath, {
    recursive: true,
  });

  if (type === "provinces") {
    writeFileSync(
      path.join(dirPath, "./provinces.json"),
      `${JSON.stringify(items, null, 2)}`,
    );

    continue;
  }

  mkdirSync(dirPath, {
    recursive: true,
  });

  for (const data of items) {
    writeFileSync(
      path.resolve(dirPath, `./${/** @type {any} */ (data).fullId}.json`),
      `${JSON.stringify(data, null, 2)}`,
    );
  }
}

/**
 * @param {string[]} args
 */
function numberize(...args) {
  return parseInt(args.join(""));
}

/**
 * @typedef {Object} Data
 * @property {string} province
 * @property {string} regency
 * @property {string} district
 * @property {string} village
 * @property {string} name
 */

/**
 * @typedef {Object} ProcessedData
 * @property {string[]} provinces
 */

/**
 * @param {Data} data
 */
function processData({ province, regency, district, village, name }) {
  switch (undefined) {
    // @ts-ignore
    case province:
      break;
    // @ts-ignore
    case regency:
      provinces.push({
        id: parseInt(province),
        name,
      });

      break;
    // @ts-ignore
    case district:
      regencies.push({
        id: parseInt(regency),
        fullId: numberize(province, regency),
        name,
      });

      break;
    // @ts-ignore
    case village:
      districts.push({
        id: parseInt(district),
        fullId: numberize(province, regency, district),
        name,
      });

      break;
    default:
      villages.push({
        id: parseInt(village),
        fullId: numberize(province, regency, district, village),
        name,
      });
  }
}
