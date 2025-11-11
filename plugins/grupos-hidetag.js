let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup)
      return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);

    // Texto después de .n
    const body = m.text || '';
    const text = body.replace(/^(\.n|n)\s*/i, '').trim();

    // Participantes
    const meta = await conn.groupMetadata(m.chat);
    const botId = conn.user?.id || conn.user?.jid;
    const mentions = meta.participants.map(p => p.id).filter(id => id !== botId);

    // --- Detectar mensaje citado (en cualquier estructura) ---
    const quoted =
      m.quoted?.fakeObj ||
      m.quoted ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
      m.msg?.contextInfo?.quotedMessage ||
      null;

    // Enviar aviso
    await conn.sendMessage(m.chat, {
      text: '📣 *Notificación:* mensaje reenviado',
      mentions,
    }, { quoted: m });

    // Si hay mensaje citado, reenviarlo
    if (quoted) {
      await conn.sendMessage(m.chat, { forward: quoted }, { quoted: m });
      // Si además escribiste texto, lo manda aparte
      if (text) await conn.sendMessage(m.chat, { text }, { quoted: m });
      return;
    }

    // Si solo hay texto (.n hola)
    if (text) {
      await conn.sendMessage(m.chat, { text }, { quoted: m });
      return;
    }

    // Si no hay nada
    await conn.reply(m.chat, '❌ No hay nada para reenviar.', m);

  } catch (err) {
    console.error('Error en .n:', err);
    await conn.reply(m.chat, '❌ Ocurrió un error al reenviar.\n' + err.message, m);
  }
};

handler.customPrefix = /^(\.n|n)(\s|$)/i;
handler.command = new RegExp();
handler.group = true;
export default handler;