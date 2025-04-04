export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\.js$": "babel-jest",
    '^.+\\.scss$': 'jest-scss-transform',
  },
};
