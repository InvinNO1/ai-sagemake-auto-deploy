const tree = require("tree-extended");
const color = require("ansi-colors");
const {yargs, error} = require("../initYargs");
const {createNewModel} = require("../process/create");
const FilterConfigurationItem = require("tree-extended/src/filters/FilterConfigurationItem");

yargs.command('create <id>', 'Create new model', cfg => {
    cfg
      .option('type', {
        alias: 't',
        description: 'Framework type: tensorflow or pytorch',
        default: 'tensorflow',
        required: false
      })
      .choices('type', ['tensorflow', 'pytorch'])
      .option('version', {
        alias: 'v',
        description: 'Framework version',
        default: 'latest'
      })
      .check(args => {
      if (!args.id.match(/^[a-zA-Z][a-zA-Z0-9_-]*$/)) {
        error('id must start with a letter and contain only letters, numbers, hyphens, and underscores')
      }
      return true
    })
  },
  args => {
    try {
      createNewModel(args.id, args.type, args.version)
      const split = '(\\/|\\\\)'
      const treeView = tree('./', {
          charset: 'utf8-icons',
          onlyFilters: [
            new FilterConfigurationItem('docker$', 0),
            new FilterConfigurationItem(`docker${split}model`, 1),
            new FilterConfigurationItem(`docker${split}model${split}${args.id}`, 2),
            new FilterConfigurationItem(`docker${split}model${split}${args.id}${split}*`, 3),
            new FilterConfigurationItem(`docker${split}build-config`, 1),
            new FilterConfigurationItem(`docker${split}build-config${split}${args.id}`, 2),
            new FilterConfigurationItem(`docker${split}build-config${split}${args.id}${split}*`, 3),

            new FilterConfigurationItem('weightAndConfig', 0),
            new FilterConfigurationItem(`weightAndConfig${split}${args.id}`, 1),
            new FilterConfigurationItem(`weightAndConfig${split}${args.id}${split}*`, 2),

            new FilterConfigurationItem('bin', 0),
            new FilterConfigurationItem(`bin${split}lib`, 1),
            new FilterConfigurationItem(`bin${split}lib${split}model`, 2),
            new FilterConfigurationItem(`bin${split}lib${split}model${split}config`, 3),
            new FilterConfigurationItem(`bin${split}lib${split}model${split}config${split}${args.id}.json`, 4),
          ]
        })
      console.log(`Model ${args.id} created successfully.`)
      console.log(treeView)
    } catch (e) {
      console.log(color.red(`ERROR: system error`))
      console.error(e)
    }
  }
)
