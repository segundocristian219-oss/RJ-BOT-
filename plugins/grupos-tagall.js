let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup)
      return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m)

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    const mentions = participants.map(p => p.id)

    // Prefijos -> banderas
    const flags = {
      52: '🇲🇽', 54: '🇦🇷', 56: '🇨🇱', 57: '🇨🇴', 58: '🇻🇪',
      51: '🇵🇪', 55: '🇧🇷', 34: '🇪🇸', 1: '🇺🇸',
      502: '🇬🇹', 503: '🇸🇻', 504: '🇭🇳', 505: '🇳🇮',
      506: '🇨🇷', 507: '🇵🇦', 591: '🇧🇴', 593: '🇪🇨',
      595: '🇵🇾', 598: '🇺🇾'
    }

    let text = '📢 *MENCIÓN GLOBAL*\n\n'

    for (const user of participants) {
      const num = user.id.split('@')[0]
      const prefix = num.replace('+', '').slice(0, 3)
      const flag =
        flags[prefix] ||
        flags[prefix.slice(0, 2)] ||
        '🏳️'
      text += `${flag} @${num}\n`
    }

    await conn.sendMessage(
      m.chat,
      {
        text,
        contextInfo: { mentionedJid: mentions }
      },
      { quoted: m }
    )
  } catch (err) {
    console.error('Error en .todos:', err)
    await conn.reply(m.chat, '⚠️ Error al mencionar: ' + err.message, m)
  }
}

handler.command = /^todos$/i
handler.group = true
export default handler