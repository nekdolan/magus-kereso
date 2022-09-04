import _ from "lodash/fp";
import settingsBase from "./data/settings.json";
import computedData from "./computed/data.json";

export const { itemLists, itemListsIndex } = _.reduce(
  (sum, computed) => {
    return {
      itemLists: { ...sum.itemLists, [computed.name]: computed.data },
      itemListsIndex: {
        ...sum.itemListsIndex,
        [computed.name]: computed.index,
      },
    };
  },
  {
    itemLists: {},
    itemListsIndex: {},
  }
)(computedData);

export const settings = _.compose(
  _.map((setting) => {
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
                }))(itemListsIndex[setting.name][input.key]),
              },
            };
      })(setting.inputs),
    };
  }),
  _.cloneDeep
)(settingsBase);

const TypeFilters = {
  range(inputName, searchValue) {
    if (!searchValue[0] && !searchValue[1]) {
      return _.identity;
    }
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
    if (_.isEmpty(searchValue)) {
      return _.identity;
    }
    const words = _.split(",", _.deburr(searchValue));
    return _.filter((item) => {
      return _.any((word) => {
        const condition = new RegExp(`.*${word}.*`);
        return condition.test(_.deburr(item[inputName]));
      })(words);
    });
  },
  list(inputName, searchValue) {
    if (_.isEmpty(searchValue)) {
      return _.identity;
    }
    return _.filter((item) => {
      return _.includes(_.toLower(item[inputName]), searchValue);
    });
  },
  single(inputName, searchValue) {
    if (_.isEmpty(searchValue)) {
      return _.identity;
    }
    return _.filter((item) => {
      console.log(searchValue, item[inputName])
      return _.toLower(_.trim(searchValue)) === _.toLower(item[inputName]);
    });
  },
  listing(inputName, searchValue) {
    if (_.isEmpty(searchValue)) {
      return _.identity;
    }
    return _.filter((item) => {
      return _.any((searchWord) => {
        console.log(searchWord, item[inputName]);
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
      return TypeFilters[input.type](searchKey, searchValue);
    }),
    _.toPairs
  )(search);
  return _.flow(filtersList)(itemLists[setting.name]);
}
