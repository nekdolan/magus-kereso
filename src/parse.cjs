const fs = require("fs");
const path = require("path");
const csv = require("@fast-csv/parse");
const _ = require("lodash/fp");
const settings = require("./data/settings.json");

const fileData = [];

settings.forEach(function (setting) {
  const target = fs.createWriteStream(
    path.resolve(__dirname, "computed/data.json")
  );
  const res = [];
  fs.createReadStream(path.resolve(__dirname, "data", setting.name + ".csv"))
    .pipe(csv.parse({ headers: setting.headers }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      res.push(_.compose(
        _.fromPairs,
        _.map(([key, value]) => {
          if (_.includes(key, setting.full)) {
            return [key, value];
          }
          return [key, _.replace('\r\n', '', value)];
        }),
        _.toPairs
      )(row));
    })
    .on("end", () => {
      fileData.push({ res, setting });
      if (fileData.length === settings.length) {
        const indexedData = _.map(({ res, setting }) => {
          return {
            data: res,
            name: setting.name,
          };
        })(fileData);
        target.write(JSON.stringify(indexedData, null, 2));
      }
    });
});
