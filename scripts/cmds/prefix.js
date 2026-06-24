// Ajoute cette fonction sous generatePrefixGif
async function generateStatusGif(globalPrefix, threadPrefix, botName) {
  const W = 850, H = 480;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(W, H);
  const outPath = path.join(CACHE_DIR, `status_${Date.now()}.gif`);
  encoder.createReadStream().pipe(fs.createWriteStream(outPath));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(12);

  let backgroundFrame = null;
  try {
    const gifBuffer = await fetchBuffer(SOLO_LEVELING_GIF);
    if (gifBuffer) backgroundFrame = await loadImage(gifBuffer);
  } catch (e) {}

  const color = "#00d4ff";

  for (let frameIndex = 0; frameIndex < 12; frameIndex++) {
    ctx.clearRect(0, 0, W, H);

    if (backgroundFrame) {
      ctx.drawImage(backgroundFrame, 0, -(frameIndex * 3), W, H + 30);
    } else {
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = "rgba(0, 10, 30, 0.65)";
    ctx.fillRect(0, 0, W, H);

    // ÉCRITURES QUI BOUGENT
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = color;
    ctx.font = "bold 65px Arial";
    ctx.textAlign = "center";
    const texts = ["HUNTER", "S-RANK", "LEVEL UP", "SYSTEM", "SHADOW"];
    for (let i = 0; i < texts.length; i++) {
      ctx.save();
      let x = W/2 + Math.cos(frameIndex * 0.4 + i) * 210;
      let y = H/2 + Math.sin(frameIndex * 0.4 + i) * 150;
      let angle = (frameIndex * 0.15 + i) * 0.5;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(texts[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // TITRE
    ctx.fillStyle = color;
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = color;
    ctx.shadowBlur = 35;
    ctx.fillText("STATUS HUNTER", W/2, 100);
    ctx.shadowBlur = 0;

    // PSEUDO JOUEUR
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Arial";
    ctx.fillText("ʚʆɞ Camille Uchiha ʚʆɞ", W/2, 145);

    // CARTE PREFIX GLOBAL
    const boxY = 200;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.strokeRect(W/2 - 230, boxY, 460, 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(W/2 - 230, boxY, 460, 100);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "18px Arial";
    ctx.fillText("Global System", W/2, boxY + 30);

    ctx.fillStyle = color;
    ctx.font = "bold 72px monospace";
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillText(globalPrefix, W/2, boxY + 80);
    ctx.shadowBlur = 0;

    // CARTE PREFIX GROUPE
    const boxY2 = 320;
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 25;
    ctx.strokeRect(W/2 - 230, boxY2, 460, 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(W/2 - 230, boxY2, 460, 100);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "18px Arial";
    ctx.fillText("This Dungeon", W/2, boxY2 + 30);

    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 72px monospace";
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 20;
    ctx.fillText(threadPrefix, W/2, boxY2 + 80);
    ctx.shadowBlur = 0;

    // FOOTER
    ctx.fillStyle = "rgba(0, 212, 255, 0.9)";
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Shadow Monarch v3.0", W - 20, H - 15);

    encoder.addFrame(ctx);
  }

  encoder.finish();
  await new Promise(resolve => setTimeout(resolve, 800));
  return outPath;
}

// Remplace ton onChat par celui-ci
onChat: async function ({ event, message, getLang, usersData }) {
  if (event.body && event.body.toLowerCase() === "prefix") {
    const userName = await usersData.getName(event.senderID);
    const botName = global.GoatBot.config.nickNameBot || "Bot";
    const globalPrefix = global.GoatBot.config.prefix;
    const threadPrefix = utils.getPrefix(event.threadID);

    try {
      await message.reply("⚙️ Scan du statut Hunter...");
      const gifPath = await generateStatusGif(globalPrefix, threadPrefix, botName);
      return message.reply({
        body: getLang("myPrefix", userName, globalPrefix, threadPrefix, botName),
        attachment: fs.createReadStream(gifPath)
      }, () => {
        try { fs.removeSync(gifPath); } catch (e) {}
      });
    } catch (err) {
      console.error(err);
      return message.reply(getLang("myPrefix", userName, globalPrefix, threadPrefix, botName));
    }
  }
}
