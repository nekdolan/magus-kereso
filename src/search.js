import _ from "lodash/fp";
import computedData from "@/computed/data.json";

export const itemLists = _.reduce((sum, computed) => {
  return { ...sum.itemLists, [computed.name]: computed.data };
}, {})(computedData);

export function getIndexedSetting(setting, indexes) {
  return {
    ...setting,
    inputs: _.map((input) => {
      return !input.index
        ? input
        : {
            ...input,
            props: {
              ...input.props,
              options: _.map((value) => ({
                label: _.upperFirst(value),
                value: value,
              }))(indexes[input.key]),
            },
          };
    })(setting.inputs),
  };
}

export function getIndexKey(key, data) {
  return _.compose(
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
  )(data);
}

export function isFilterEmpty(type, searchValue) {
  switch (type) {
    case "range":
      return !searchValue[0] && !searchValue[1];
    default:
      return searchValue === 0 || !searchValue || _.isEmpty(searchValue);
  }
}

const TypeFilters = {
  range(inputName, searchValue) {
    return _.filter((item) => {
      const numberValue = _.toNumber(item[inputName]);
      if (_.isNaN(numberValue)) {
        return false;
      }
      const [min, max] = _.sortBy(_.identity)(searchValue);
      return numberValue >= min && numberValue <= max;
    });
  },
  search(inputName, searchValue) {
    const words = _.split(",", _.deburr(searchValue));
    return _.filter((item) => {
      return _.any((word) => {
        const condition = new RegExp(`.*${word}.*`, "i");
        return condition.test(_.deburr(item[inputName]));
      })(words);
    });
  },
  list(inputName, searchValue) {
    return _.filter((item) => {
      return _.includes(_.toLower(item[inputName]), searchValue);
    });
  },
  single(inputName, searchValue) {
    return _.filter((item) => {
      return _.toLower(_.trim(searchValue)) === _.toLower(item[inputName]);
    });
  },
  listing(inputName, searchValue) {
    return _.filter((item) => {
      return _.any((searchWord) => {
        return new RegExp(`.*${searchWord}.*`).test(
          _.deburr(_.toLower(item[inputName]))
        );
      })(searchValue);
    });
  },
};

export function filterItems(setting, search) {
  const filtersList = _.compose(
    _.map(([searchKey, searchValue]) => {
      const input = _.find((input) => input.key === searchKey)(setting.inputs);
      if (isFilterEmpty(input.type, searchValue)) {
        // return [input, null];
        return [input, _.identity];
      }
      const filter = TypeFilters[input.type](searchKey, searchValue);
      return [input, filter];
    }),
    _.toPairs
  )(search);
  return _.reduce(
    (sum, [input, filter]) => {
      const searchKey = input.key;
      const list = filter(sum.list);
      const index = !input.index
        ? sum.index
        : { ...sum.index, [searchKey]: getIndexKey(searchKey, sum.list) };
      return { list, index };
    },
    {
      list: itemLists[setting.name],
      index: {},
    }
  )(filtersList);
}
