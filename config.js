import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = ['180650938249287']

global.mods = []
global.prems = []

global.emoji = '📎'
global.emoji2 = '🏞️'
global.namebot = '𝖠𝗇𝗀𝖾𝗅 𝖡𝗈𝗍'
global.redes = 'https://chat.whatsapp.com/KDI7NNovzdwJayx1gI1cue?mode=ems_copy_t'
global.botname = '𝖠𝗇𝗀𝖾𝗅 𝖡𝗈𝗍'
global.banner = 'https://raw.githubusercontent.com/SoySapo6/tmp/refs/heads/main/Permanentes/images%20(8).jpeg'
global.packname = '𝖠𝗇𝗀𝖾𝗅 𝖡𝗈𝗍'
global.author = '𝖣𝖾𝗌𝖺𝗋𝗈𝗅𝗅𝖺𝖽𝗈 𝗉𝗈𝗋 𝖠𝗇𝗀𝖾𝗅'
global.moneda = '𝖠𝗇𝗀𝖾𝗅𝖼𝗈𝗂𝗇𝗌'
global.libreria = 'Baileys'
global.baileys = 'V 6.7.16'
global.vs = '2.2.0'
global.usedPrefix = '.'
global.user2 = '18'
global.sessions = '𝖠𝗇𝗀𝖾𝗅𝖡𝗈𝗍'
global.jadi = '𝖠𝗇𝗀𝖾𝗅𝖻𝗈𝗍𝗌'
global.yukiJadibts = true

global.namecanal = '𝖠𝗇𝗀𝖾𝗅 𝖡𝗈𝗍 𝖣𝖾𝗌𝖺𝗋𝗋𝗈𝗅𝗅𝗈'
global.idcanal = '120363424241780448@newsletter'
global.idcanal2 = '120363424241780448@newsletter'
global.canal = 'https://whatsapp.com/channel/0029VbBIgz1HrDZg92ISUl2M'
global.canalreg = '120363424241780448@newsletter'

global.ch = {
  ch1: '120363424241780448@newsletter'
}

global.multiplier = 69
global.maxwarn = 2

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Se actualizo el 'config.js'"))
  import(`file://${file}?update=${Date.now()}`)
})
