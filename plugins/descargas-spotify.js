import yts from "yt-search";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const TMP_DIR = path.join(process.cwd(), "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

async function handlePlay(conn, chatId, text, quoted) {
  if (!text?.trim()) return conn.sendMessage(chatId, { text: "✳️ Usa: .play <término>" }, { quoted });

  // Buscar video
  let video;
  try {
    const res = await yts(text);
    video = res.videos?.[0];
  } catch {}
  if (!video) return conn.sendMessage(chatId, { text: "❌ Sin resultados." }, { quoted });

  const { url: videoUrl, title, thumbnail } = video;

  // Enviar miniatura
  await conn.sendMessage(chatId, { image: { url: thumbnail }, caption: `🎵 ${title}\n🌐 ${videoUrl}` }, { quoted });

  // Archivo temporal
  const tempFile = path.join(TMP_DIR, `${crypto.randomUUID()}.mp3`);

  try {
    // Descargar y convertir en stream directo
    await new Promise((resolve, reject) => {
      const stream = ytdl(videoUrl, { filter: "audioonly", quality: "highestaudio" });
      ffmpeg(stream)
        .audioCodec("libmp3lame")
        .audioBitrate("128k")
        .format("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(tempFile);
    });

    // Enviar audio
    await conn.sendMessage(chatId, {
      audio: fs.readFileSync(tempFile),
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted });
  } catch (e) {
    conn.sendMessage(chatId, { text: `❌ Error: ${e.message}` }, { quoted });
  } finally {
    fs.existsSync(tempFile) && fs.unlinkSync(tempFile);
  }
}

const handler = async (msg, { conn, text, command }) => {
  const chatId = msg.key.remoteJid;
  if (command === "spotify") await handlePlay(conn, chatId, text, msg);
}

handler.help = ["play"];
handler.tags = ["descargas"];
handler.command = ["spotify"];
export default handler;