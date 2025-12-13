import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = ['237722815971456', '245573982662762', '217158512549931', '213022542930125', '25271637938398', '230008920490230']

global.mods = []
global.prems = []

global.emoji = '📎'
global.emoji2 = '🏞️'
global.namebot = '𝑹𝑱 𝑩𝑶𝑻'
global.redes = 'https://whatsapp.com/channel/0029VbCgp4GEawdleolNwU0J'
global.botname = '𝑹𝑱 𝑩𝑶𝑻'
global.banner = 'https://cdn.russellxz.click/4bc78abe.jpeg'
global.packname = '𝑹𝑱 𝑩𝑶𝑻'
global.author = '𝖣𝖾𝗌𝖺𝗋𝗋𝗈𝗅𝗅𝖺𝖽𝗈 𝗉𝗈𝗋 Rich'
global.libreria = 'Baileys'
global.baileys = 'V 6.7.16'
global.vs = '2.2.0'
global.usedPrefix = '.'
global.user2 = '18'
global.sessions = '𝑹𝑱 𝑩𝑶𝑻'
global.jadi = '𝑹𝑱 𝑩𝑶𝑻'
global.yukiJadibts = true

global.namecanal = '𝑹𝑱 𝑩𝑶𝑻 𝖣𝖾𝗌𝖺𝗋𝗋𝗈𝗅𝗅𝗈'
global.idcanal = ''
global.idcanal2 = ''
global.canal = 'https://whatsapp.com/channel/0029VbCgp4GEawdleolNwU0J'
global.canalreg = ''

global.ch = {
  ch1: '120363402177795471@newsletter'
}

global.multiplier = 69
global.maxwarn = 2

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Se actualizo el 'config.js'"))
  import(`file://${file}?update=${Date.now()}`)
})
