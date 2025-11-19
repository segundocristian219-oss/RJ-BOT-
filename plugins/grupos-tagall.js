const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  if (!m.isGroup) return;
  if (!isAdmin && !isOwner) return global.dfail?.('admin', m, conn);

  const flagMap = {
    "591": "🇧🇴", "593": "🇪🇨", "595": "🇵🇾", "598": "🇺🇾", "507": "🇵🇦",
    "505": "🇳🇮", "506": "🇨🇷", "502": "🇬🇹", "503": "🇸🇻", "504": "🇭🇳",
    "509": "🇭🇹", "549": "🇦🇷", "54": "🇦🇷", "55": "🇧🇷", "56": "🇨🇱",
    "57": "🇨🇴", "58": "🇻🇪", "52": "🇲🇽", "53": "🇨🇺", "51": "🇵🇪",
    "1": "🇺🇸", "34": "🇪🇸"
  };

  function getFlag(numero) {
    // Revisa códigos de 3, 2 y 1 dígito para máxima precisión
    const code3 = numero.slice(0, 3);
    const code2 = numero.slice(0, 2);
    const code1 = numero.slice(0, 1);

    return flagMap[code3] || flagMap[code2] || flagMap[code1] || "🌐";
  }

  let texto = `*!  MENCION GENERAL  !*\n`;
  texto += `   *PARA ${participants.length} MIEMBROS* 🔔\n\n`;

  for (const user of participants) {
    const numero = user.id.split('@')[0];
    const bandera = getFlag(numero);

    texto += `┊» ${bandera} @${numero}\n`;
  }

  await conn.sendMessage(m.chat, { react: { text: '🔔', key: m.key } });

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: participants.map(p => p.id)
  }, { quoted: m });
};

handler.customPrefix = /^\.?(todos)$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;

export default handler;