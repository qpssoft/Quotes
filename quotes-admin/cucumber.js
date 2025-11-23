module.exports = {
  default: {
    require: ['tests/steps/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      '@cucumber/pretty-formatter'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 60000, // 60 seconds default timeout
    publishQuiet: true
  }
};
