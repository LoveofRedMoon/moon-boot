#!/usr/bin/env node

const { program } = require('commander')
const config = require('./package.json')
const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const child = require('child_process')

program
  .version(config.version)
  .command('new <projectName>', { isDefault: true })
  .description('create a new project.')
  .action((projectName) => {
    createProject(projectName).catch(console.error)
  })

program
  .command('use <pluginName>')
  .description('use some plugin for current project.')
  .action((pluginName) => {
    installPlugin(pluginName).catch(console.error)
  })

program.addHelpText(
  'afterAll',
  `
Example call:
  $ npx create-moon-boot my-project
  $ npx create-moon-boot new my-project
  $ npx create-moon-boot use express`
)

program.parse()

async function createProject(projectName) {
  console.log(chalk.yellowBright(`create project [${projectName}]`))
  const basePath = path.resolve(process.cwd(), projectName)
  await fs.mkdir(basePath)
  await exec('npm init -y', { cwd: basePath })
  console.log(chalk.yellowBright(`installing ...`))
  await exec('npm i ts-node typescript tslib -D', { cwd: basePath })
  await exec('npm i moon-boot', { cwd: basePath })
  await fs.mkdirp(path.resolve(basePath, 'src'))
  await fs.writeFile(
    path.resolve(basePath, 'tsconfig.json'),
    `\
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "sourceMap": false,
    "outDir": "./dist",
    "removeComments": true,
    "strict": true,
    "noImplicitAny": false,
    "strictNullChecks": true,
    "alwaysStrict": true,
    "moduleResolution": "node",
    "baseUrl": "./src",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
  },
  "include": [
    "src/**/*"
  ],
}`
  )
  await fs.writeFile(
    path.resolve(basePath, 'src/index.ts'),
    `\
import { start } from 'moon-boot'
class Main {
    constructor() {
        start(__dirname)
    }
}

new Main()`
  )
  await fs.mkdirp(path.resolve(basePath, 'src/resources'))
  await fs.writeFile(
    path.resolve(basePath, 'src/resources/application.yml'),
    ''
  )
  await addScript(
    path.resolve(basePath, 'package.json'),
    'start',
    'ts-node src/index'
  )
  console.log(
    chalk.yellowBright(`project ${projectName} create success.

following steps below to start.
> cd ${projectName}
> npm run start

To use plugins, try
> cd ${projectName}
> npx create-moon-boot use plugin-express`)
  )
}

async function installPlugin(pluginName) {
  console.log(chalk.yellowBright(`install plugin [${pluginName}]`))
  const basePath = process.cwd()
  try {
    require.resolve('moon-boot', { paths: [basePath] })
  } catch {
    throw new Error('This project have not install moon-boot!')
  }
  await exec(`npm i @moonboot/${pluginName}`)
  try {
    const data = require('@moonboot/plugin-express/example')
    await Promise.all(
      Object.entries(data.files ?? {}).map(async ([file, dest]) => {
        const destPath = path.resolve(basePath, dest)
        if (!destPath.startsWith(basePath)) {
          console.error(
            chalk.red(
              `[moon] plugin ${pluginName} can not copy file because file is out of project`
            )
          )
          return
        }
        await fs.mkdirp(path.resolve(destPath, '..'))
        try {
          await fs.access(destPath, fs.constants.F_OK)
          console.error(
            chalk.redBright(
              `[moon] plugin ${pluginName} can not copy file ${destPath} because file exists. Content is following:`
            )
          )
          console.log(chalk.redBright('```ts'))
          console.log((await fs.readFile(file)).toString('utf-8'))
          console.log(chalk.redBright('```'))
        } catch {}
        await fs.copyFile(file, destPath)
        console.log(
          chalk.yellowBright(
            `[moon] plugin ${pluginName} copy example file ${destPath}`
          )
        )
      })
    )
    console.log(
      chalk.yellowBright(
        `[moon] plugin ${pluginName} provide the following envs. See README.md for more detail.`
      )
    )
    console.table(data.env)
  } catch (e) {
    console.log(e)
  }
  return
  await fs.mkdir(basePath)
  await exec('npm init -y', { cwd: basePath })
  console.log(chalk.yellowBright(`installing ...`))
  await exec('npm i ts-node typescript tslib -D', { cwd: basePath })
  await exec('npm i moon-boot', { cwd: basePath })
  await fs.mkdirp(path.resolve(basePath, 'src'))
  await fs.writeFile(
    path.resolve(basePath, 'tsconfig.json'),
    `\
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "sourceMap": false,
    "outDir": "./dist",
    "removeComments": true,
    "strict": true,
    "noImplicitAny": false,
    "strictNullChecks": true,
    "alwaysStrict": true,
    "moduleResolution": "node",
    "baseUrl": "./src",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
  },
  "include": [
    "src/**/*"
  ],
}`
  )
  await fs.writeFile(
    path.resolve(basePath, 'src/index.ts'),
    `\
import { start } from 'moon-boot'
class Main {
    constructor() {
        start(__dirname)
    }
}

new Main()`
  )
  await addScript(
    path.resolve(basePath, 'package.json'),
    'start',
    'ts-node src/index'
  )
  console.log(
    chalk.yellowBright(`project ${projectName} create success.

following steps below to start.
> cd ${projectName}
> npm run start

To use plugins, try
> cd ${projectName}
> npx create-moon-boot use plugin-express`)
  )
}

function exec(command, options) {
  return new Promise((resolve, reject) => {
    let result = {}
    const cp = child.exec(command, options, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout
        err.stderr = stderr
        reject(err)
        return
      }

      result.stdout = stdout
      result.stderr = stderr
      if ('code' in result) {
        resolve(result)
      }
    })

    cp.on('exit', (code, signal) => {
      result.code = code
      result.signal = signal
      if ('stdout' in result) {
        resolve(result)
      }
    })
  })
}

async function addScript(p, name, script) {
  const data = (await fs.readFile(p)).toString('utf-8')
  try {
    const j = JSON.parse(data)
    j.script[name] = script
    return fs.writeFile(p, JSON.stringify(j))
  } catch (e) {}
  const newData = data.replace(
    /\"scripts\"\s*\:\s*\{/,
    `"scripts":{"${name}":"${script}",`
  )
  return fs.writeFile(p, newData)
}
