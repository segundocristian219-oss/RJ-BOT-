import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
'217158512549931', 
'230008920490230',
'', 
''
] 

global.mods = []
global.prems = []

global.emoji = '📎'
global.emoji2 = '🏞️'
global.namebot = 'RJ BOT'
global.botname = 'RJ BOT'
global.banner = 'https://cdn.russellxz.click/84624b15.jpeg'
global.packname = 'RJ BOT'
global.author = '𝖣𝖾𝗌𝖺𝗋𝗅𝗅𝖺𝖽𝗈 𝗉𝗈𝗋 RICH'
global.sessions = 'RJ BOT'

global.APIs = {
sky: 'https://api-sky.ultraplus.click',
may: 'https://mayapi.ooguy.com'
}

global.APIKeys = {
sky: 'Angxlllll',
may: 'may-0595dca2'
}

const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Se actualizó el 'config.js'"))
import(`file://${file}?update=${Date.now()}`)
})