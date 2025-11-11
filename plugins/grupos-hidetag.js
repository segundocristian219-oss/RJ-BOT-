let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) 
      return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);

    // Extraer texto después de .n o n
    const body = m.text || '';
    const text = body.replace(/^(\.n|n)\s*/i, '').trim();

    // Obtener datos del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);
    const botNumber = conn.user?.id || conn.user?.jid;
    const mentions = participants.filter(id => id !== botNumber);

    // Si responde a un mensaje (imagen, sticker, video, etc.)
    if (m.quoted) {
      const quotedMsg = m.quoted.msg || m.quoted.message;
      if (!quotedMsg)
        return conn.reply(m.chat, '❌ El mensaje citado no se pudo procesar.', m);

      await conn.sendMessage(m.chat, {
        text: '📣 *Notificación:* mensaje reenviado',
        mentions
      }, { quoted: m });

      // Reenviar mensaje (usa el objeto completo)
      await conn.sendMessage(m.chat, { forward: m.quoted }, { quoted: m });
      return;
    }

    // Si el usuario escribió texto (ejemplo: .n hola)
    if (text.length > 0) {
      await conn.sendMessage(m.chat, {
        text: '📣 *Notificación:* mensaje reenviado',
        mentions
      }, { quoted: m });

      await conn.sendMessage(m.chat, {
        text
      }, { quoted: m });
      return;
    }

    // Si no hay texto ni mensaje citado
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