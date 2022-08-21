import { packageExtension } from '@lvce-editor/package-extension'
import fs, { readFileSync, writeFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = path.join(__dirname, '..')

fs.rmSync(join(root, 'dist'), { recursive: true, force: true })

const getVersion = () => {
  if (process.env.RG_VERSION) {
    if (process.env.RG_VERSION.startsWith('v')) {
      return process.env.RG_VERSION.slice(1)
    }
    return process.env.RG_VERSION
  }
  return '0.0.0-dev'
}

fs.mkdirSync(path.join(root, 'dist'))

fs.copyFileSync(join(root, 'README.md'), join(root, 'dist', 'README.md'))
const extensionJson = JSON.parse(
  readFileSync(join(root, 'extension.json'), 'utf8')
)
extensionJson.version = getVersion()
writeFileSync(
  join(root, 'dist', 'extension.json'),
  JSON.stringify(extensionJson, null, 2) + '\n'
)
fs.cpSync(join(root, 'src'), join(root, 'dist', 'src'), { recursive: true })

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
