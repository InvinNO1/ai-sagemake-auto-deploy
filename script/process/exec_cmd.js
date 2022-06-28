const {exec} = require('child_process')
exports.exec_cmd = (cmd, env) => {
  return new Promise((resolve, reject) => {
    const child = exec(cmd.replace(/\n/g, ' '), env, error => {
      error ? reject(error) : resolve()
    })
    child.stdin.pipe(process.stdin)
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
  })
}