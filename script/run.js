#!/usr/bin/env node
const {yargs} = require("./initYargs");
require('./command/create')
require('./command/deploy')
require('./command/remove')
require('./command/local')

async function run() {
  const argv = await yargs.argv
  if (!argv._.length) {
    yargs.showHelp()
  }
}
run().then()