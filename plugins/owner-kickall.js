import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const handler = async (m, { conn }) => {
  const q = m.quoted;

  if (!q || !q.message || !q.message.documentMessage) {
    return m.reply("📄 *Responde a un documento .pdf para convertirlo.*");
  }

  const mime = q.message.documentMessage.mimetype || "";
  if (!mime.includes("pdf")) {
    return m.reply("❌ *El archivo respondido no es un PDF.*");
  }

  try {
    const fileName = q.message.documentMessage.fileName || "archivo.pdf";
    const stream = await downloadContentFromMessage(q.message.documentMessage, 'document');

    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filePath = path.join(tempDir, fileName);
    const writer = fs.createWriteStream(filePath);

    for await (const chunk of stream) {
      writer.write(chunk);
    }
    writer.end();

    // Esperar a que se cierre el archivo
    await new Promise(resolve => writer.on('finish', resolve));

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      mimetype: "application/pdf",
      fileName
    }, { quoted: m });

    fs.unlinkSync(filePath); // limpiar
  } catch (error) {
    console.error(error);
    m.reply("❌ *Error al procesar el PDF.*");
  }
};

handler.command = ["pdf", "topdf"];
export default handler;