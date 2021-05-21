const chalk = require('chalk')
const environment = process.env.NODE_ENV || 'production'
const mode = process.env.MODE || 'web'

const projectConfiguration = require('./../project.json')
const localMachineSettings = projectConfiguration.local_machine

const optionPresets = {
  development: {
    entryFile: 'index.jsx',
    targetType: 'web',
    host: '0.0.0.0',
    port: localMachineSettings.port || '8080',
    showBundleAnalyzer: false,
    sourceMap: true,
    beautify: true,
    comments: true,
    publicPath: '/',
    baseHref: '/',
  },
  production: {
    entryFile: 'index.jsx',
    targetType: 'web',
    host: '0.0.0.0',
    port: localMachineSettings.port || '8080',
    showBundleAnalyzer: false,
    sourceMap: false,
    beautify: false,
    comments: false,
    publicPath: '/',
    baseHref: '/',
  },
  test: {
    entryFile: 'index.jsx',
    targetType: 'web',
    host: '0.0.0.0',
    port: localMachineSettings.port || '8080',
    showBundleAnalyzer: false,
    sourceMap: false,
    beautify: false,
    comments: false,
    publicPath: '/',
    baseHref: '/',
  },
}

const options = {
  // Development options
  'development-web': optionPresets.development,
  'development-file': {
    ...optionPresets.development,
    publicPath: '',
    baseHref: './',
  },
  // Production options
  'production-web': optionPresets.production,
  'production-file': {
    ...optionPresets.production,
    publicPath: '',
    baseHref: './',
  },
  // Test options
  'test-web': optionPresets.test,
  'test-file': {
    ...optionPresets.test,
    publicPath: '',
    baseHref: './',
  },
}

console.log(
  `WEBPACK: ${chalk.blueBright(environment)}, ${chalk.blueBright(mode)}`
)
module.exports = require(`./${environment}.webpack.jsx`)(
  options[`${environment}-${mode}`]
)
