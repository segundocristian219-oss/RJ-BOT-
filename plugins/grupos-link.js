import fetch from "node-fetch";

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo funciona en grupos."
    }, { quoted: msg });
  }

  try {
    let pfp;
    try {
      pfp = await conn.profilePictureUrl(chatId, "image");
    } catch {
      pfp = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
    }

    const code = await conn.groupInviteCode(chatId);
    const link = `https://chat.whatsapp.com/${code}`;

    const res = await fetch(pfp);
    const buffer = await res.buffer();

    await conn.sendMessage(chatId, {
      image: buffer,
      caption: `🔗 *Link del grupo:*\n${link}`
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "🔗", key: msg.key }
    });

  } catch {
    await conn.sendMessage(chatId, {
      text: "⚠️ No se pudo obtener el enlace o la foto del grupo. Asegúrate que el bot sea admin."
    }, { quoted: msg });
  }
};

handler.command = ["link"];
export default handler;