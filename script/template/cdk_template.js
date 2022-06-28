exports.config_json = (id, framework, frameworkVersion) => `{
  "id": "${id}",
  "apiUrl": "${id}",
  "initialVariantWeight": 1,
  "memorySizeInMb": 1024,
  "maxConcurrency": 20,
  "framework": "${framework}",
  "frameworkVersion": "${frameworkVersion}",
  "removed": false
}`