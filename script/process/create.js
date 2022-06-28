const fs = require("fs");
const {config_json} = require("../template/cdk_template");
const {rootPath} = require("./const");

const getModelPath = (id) => `${rootPath}/docker/model/${id}`
const getSetupPath = (id) => `${rootPath}/docker/build-config/${id}`
const cdkConfigPath = `${rootPath}/bin/lib/model/config`
const getWeightPath = (id) => `${rootPath}/weightAndConfig/${id}`

const createNewModel = (id, framework, frameworkVersion) => {
  //region create docker model
  const modelPath = getModelPath(id)
  if (!fs.existsSync(modelPath)) {
    fs.mkdirSync(modelPath, {recursive: true})
  }
  const inferencePath = `${modelPath}/inference.py`
  if (!fs.existsSync(inferencePath)) {
    fs.copyFileSync(`${rootPath}/script/template/inference.py`, inferencePath)
  }
  const setupPath = getSetupPath(id)
  if (!fs.existsSync(setupPath)) {
    fs.mkdirSync(setupPath, {recursive: true})
  }

  const requirementsPath = `${setupPath}/requirements.txt`
  if (!fs.existsSync(requirementsPath)) {
    fs.copyFileSync(`${rootPath}/script/template/requirements.txt`, requirementsPath)
  }
  //endregion

  //region create cdk deploy config
  const cdkConfigFilePath = `${cdkConfigPath}/${id}.json`
  if (fs.existsSync(cdkConfigFilePath)) {
    let config = fs.readFileSync(cdkConfigFilePath, 'utf-8')
    config = config.replace(/"removed" *: *true/, '"removed": false')
    fs.writeFileSync(cdkConfigFilePath, config)
  } else {
    const configContent = config_json(id, framework, frameworkVersion)
    fs.writeFileSync(cdkConfigFilePath, configContent)
  }

  const configIndexPath = `${cdkConfigPath}/index.ts`
  let configIndex = fs.readFileSync(configIndexPath, 'utf-8')

  const importText = `import ${id}Config from './${id}.json'`
  if (!configIndex.includes(importText)) {
    configIndex = configIndex.replace('// IMPORT_NEW_CONFIG', '// IMPORT_NEW_CONFIG' + '\n' + importText)
    const addConfig = `configModels.push(${id}Config)`
    configIndex = configIndex.replace('// ADD_NEW_CONFIG', '// ADD_NEW_CONFIG' + '\n' + addConfig)
    fs.writeFileSync(configIndexPath, configIndex, {flag: 'w'})
  }
  //endregion

  //region create weight and model config
  const weightPath = getWeightPath(id)
  if (!fs.existsSync(weightPath)) {
    fs.mkdirSync(weightPath, {recursive: true})
  }
  //endregion
}

exports.getModelPath = getModelPath
exports.getSetupPath = getSetupPath
exports.cdkConfigPath = cdkConfigPath
exports.getWeightPath = getWeightPath
exports.createNewModel = createNewModel