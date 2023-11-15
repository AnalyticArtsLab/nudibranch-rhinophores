module.exports = {
  verbose: true,
  moduleFileExtensions: ['js'],
  moduleDirectories: ['node_modules',  'shared'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/!(@babylonjs)'],
  reporters: ['default',['jest-summary-reporter', {diffs: false}]],
};