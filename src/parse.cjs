const fs = require("fs");
const path = require("path");
const csv = require("@fast-csv/parse");
const _ = require("lodash/fp");
const settings = require("./data/settings.json");

function getIndexKeys(setting, data) {
  return _.compose(
    _.fromPairs,
    _.map((key) => {
      return [
        key,
        _.compose(
          _.thru(([numberStrings, strings]) => {
            return [
              ..._.sortBy(_.toNumber)(numberStrings),
              ..._.sortBy(_.deburr)(strings),
            ];
          }),
          _.partition((value) => !_.isNaN(_.toNumber(value))),
          _.reject((value) => value === ""),
          _.uniq,
          _.map(_.trim),
          _.map(_.toLower),
          _.map(key)
        )(data),
      ];
    }),
    _.map("key"),
    _.filter("index")
  )(setting.inputs);
}

const fileData = [];

settings.forEach(function (setting) {
  const target = fs.createWriteStream(
    path.resolve(__dirname, "computed/data.json")
  );
  const res = [];
  fs.createReadStream(path.resolve(__dirname, "data", setting.name + ".csv"))
    .pipe(csv.parse({ headers: setting.headers }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => res.push(row))
    .on("end", () => {
      fileData.push({ res, setting });
      if (fileData.length === settings.length) {
        const indexedData = _.map(({ res, setting }) => {
          return {
            data: res,
            name: setting.name,
            index: getIndexKeys(setting, res),
          };
        })(fileData);
        target.write(JSON.stringify(indexedData, null, 2));
      }
    });
});
