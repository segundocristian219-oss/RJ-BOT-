let handler = async (m, { conn, text }) => {
  try {
    if (!m.isGroup) 
      return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);

    // Obtener lista de miembros del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);
    const botNumber = conn.user?.id || conn.user?.jid;
    const mentions = participants.filter(id => id !== botNumber);

    // Si hay mensaje citado (foto, video, sticker, etc.)
    if (m.quoted) {
      await conn.sendMessage(m.chat, {
        text: '📣 *Notificación:* mensaje reenviado',
        mentions
      }, { quoted: m });

      // Reenviar el mensaje original
      await conn.sendMessage(m.chat, { forward: m.quoted }, { quoted: m });
      return;
    }

    // Si el usuario escribió texto después del .n
    if (text && text.trim().length > 0) {
      await conn.sendMessage(m.chat, {
        text: '📣 *Notificación:* mensaje reenviado',
        mentions
      }, { quoted: m });

      // Enviar solo el texto (sin el comando)
      await conn.sendMessage(m.chat, {
        text: text.trim()
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