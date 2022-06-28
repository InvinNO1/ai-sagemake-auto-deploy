const fs = require("fs");
const {getModelPath, getSetupPath, getWeightPath} = require("./create");

exports.removeModel = (id) => {
  //region remove docker model
  const modelPath = getModelPath(id)
  if (fs.existsSync(modelPath)) {
    fs.rmdirSync(modelPath, {recursive: true, force: true})
  }
  const setupPath = getSetupPath(id)
  if (fs.existsSync(setupPath)) {
    fs.rmdirSync(setupPath, {recursive: true, force: true})
  }
  //endregion

  //region remove weight and model config
  const weightPath = getWeightPath(id)
  if (fs.existsSync(weightPath)) {
    fs.rmdirSync(weightPath, {recursive: true, force: true})
  }
  //endregion
}