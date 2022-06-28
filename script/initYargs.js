const color = require("ansi-colors");
const yargs = require('yargs')
  .fail((msg, err, args)=> {
    yargs.showHelp()
    console.log(color.red(`ERROR: ${msg}`))
    yargs.exit(1)
  })
  .help('h')
  .version(false)
exports.yargs = yargs

exports.error = (message) => {
  throw Error(color.red(message))
}