import pkg from '@whiskeysockets/baileys'
const { delay } = pkg

let listaInactivos = {}

async function actualizarParticipantes(conn, chatId) {
    let meta = await conn.groupMetadata(chatId)
    let participantes = meta.participants.map(v => v.id)

    if (!listaInactivos[chatId]) listaInactivos[chatId] = {}

    for (let user of participantes) {
        if (!listaInactivos[chatId][user]) {
            listaInactivos[chatId][user] = {
                lastMessage: 0
            }
        }
    }
}

async function limpiarInactivos(chatId) {
    let ahora = Date.now()
    let ttl = 72 * 60 * 60 * 1000

    for (let user in listaInactivos[chatId]) {
        let data = listaInactivos[chatId][user]
        if (data.lastMessage !== 0 && ahora - data.lastMessage < ttl) {
            delete listaInactivos[chatId][user]
        }
    }
}

let messageHandler = async (m, { conn }) => {
    if (!m.isGroup) return
    if (!m.sender) return
    if (m.sender === conn.user.jid) return

    let tipo = m.message ? Object.keys(m.message)[0] : null
    const validMessages = [
        "conversation",
        "extendedTextMessage",
        "imageMessage",
        "videoMessage",
        "audioMessage",
        "stickerMessage",
        "documentMessage"
    ]

    if (!validMessages.includes(tipo)) return

    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    let userData = global.db.data.users[m.sender]

    if (!userData.groups) userData.groups = {}
    if (!userData.groups[m.chat]) userData.groups[m.chat] = {}

    userData.groups[m.chat].lastMessage = Date.now()
    global.db.data.users[m.sender] = userData

    if (!listaInactivos[m.chat]) listaInactivos[m.chat] = {}

    await actualizarParticipantes(conn, m.chat)

    if (listaInactivos[m.chat][m.sender]) {
        listaInactivos[m.chat][m.sender].lastMessage = Date.now()
    }

    await limpiarInactivos(m.chat)
}

let handler = async (m, { conn, participants, command }) => {
    const HORAS = 72
    const INACTIVIDAD = HORAS * 60 * 60 * 1000
    const ahora = Date.now()

    let miembros = participants.map(v => v.id)
    let fantasmas = []

    for (let usuario of miembros) {
        if (usuario === conn.user.jid) continue
        let p = participants.find(u => u.id === usuario)
        if (p?.admin || p?.isAdmin || p?.isSuperAdmin) continue

        let dataUser = global.db.data.users[usuario]
        let lastMsg = dataUser?.groups?.[m.chat]?.lastMessage || 0

        let enLista = listaInactivos[m.chat]?.[usuario]?.lastMessage || 0

        if (!lastMsg && !enLista) {
            fantasmas.push(usuario)
            continue
        }

        let ultimo = lastMsg || enLista

        if (ahora - ultimo >= INACTIVIDAD) {
            fantasmas.push(usuario)
        }
    }

    if (fantasmas.length === 0) {
        return conn.reply(m.chat, "No hay fantasmas en este grupo.", m)
    }

    if (command === 'fankick') {
        await conn.groupParticipantsUpdate(m.chat, fantasmas, 'remove')
        return conn.reply(
            m.chat,
            `Fantasmas eliminados:\n${fantasmas.map(v => '@' + v.split('@')[0]).join('\n')}`,
            null,
            { mentions: fantasmas }
        )
    }

    let mensaje =
`[ INACTIVIDAD DE 72 HORAS ]

Grupo: ${await conn.getName(m.chat)}
Miembros: ${miembros.length}

Fantasmas detectados:
${fantasmas.map(v => '👻 @' + v.split('@')[0]).join('\n')}

Usa .fankick para eliminarlos.`

    conn.reply(m.chat, mensaje, null, { mentions: fantasmas })
}

handler.help = ['fantasmas', 'fankick']
handler.tags = ['group']
handler.command = /^(fantasmas|verfantasmas|sider|fankick)$/i
handler.admin = true

global.fantasmaAutoCheck = global.fantasmaAutoCheck || {}

setInterval(async () => {
    try {
        let chats = Object.keys(global.db.data.chats || {})

        for (let id of chats) {
            if (!global.db.data.chats[id]?.autoFantasma) continue

            let metadata = await conn.groupMetadata(id).catch(() => null)
            if (!metadata) continue

            let participants = metadata.participants
            const HORAS = 72
            const INACTIVIDAD = HORAS * 60 * 60 * 1000
            const ahora = Date.now()

            let miembros = participants.map(v => v.id)
            let fantasmas = []

            for (let usuario of miembros) {
                if (usuario === conn.user.jid) continue
                let p = participants.find(u => u.id === usuario)
                if (p?.admin || p?.isAdmin || p?.isSuperAdmin) continue

                let dataUser = global.db.data.users[usuario]
                let lastMsg = dataUser?.groups?.[id]?.lastMessage || 0
                let enLista = listaInactivos[id]?.[usuario]?.lastMessage || 0

                let ultimo = lastMsg || enLista

                if (!ultimo || ahora - ultimo >= INACTIVIDAD) {
                    fantasmas.push(usuario)
                }
            }

            if (fantasmas.length === 0) continue

            let mensaje =
`[ AUTO-REVISIÓN DE FANTASMAS ]

Grupo: ${await conn.getName(id)}

Fantasmas detectados:
${fantasmas.map(v => '👻 @' + v.split('@')[0]).join('\n')}

Usa .fankick si deseas eliminarlos.`

            conn.sendMessage(id, { text: mensaje, mentions: fantasmas })
        }

    } catch (e) {}
}, 24 * 60 * 60 * 1000)

export { messageHandler }
export default handler