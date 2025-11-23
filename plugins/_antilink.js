const urlRegex = /(https?:\/\/[^\s]+)/i

export async function before(m, { conn, isAdmin }) {
    if (m.isBaileys && m.fromMe) return !0
    if (!m.isGroup) return !1

    let chat = global.db.data.chats[m.chat]
    if (!chat.antiLink) return !0

    const body = (m.text || "").toLowerCase()
    const isUrl = urlRegex.test(body)

    if (isUrl && !isAdmin) {
        try {
            const thisGroupLink = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`
            if (body.includes(thisGroupLink.toLowerCase())) return !0
            if (m.sender === this.user.jid) return !0

            try {
                await conn.sendMessage(m.chat, { delete: m.key })
            } catch (e) {}

            try {
                await conn.reply(
                    m.chat,
                    `⚠️ *𝙽𝚘 𝚂𝚎 𝚙𝚎𝚛𝚖𝚒𝚝𝚎𝚗 𝙻𝚒𝚗𝚔𝚜* *@${m.sender.split('@')[0]}*`,
                    null,
                    { mentions: [m.sender] }
                )
            } catch (e) {}
        } catch (e) {}
    }

    return !0
}