const { getStreamsFromAttachment } = global.utils;
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const notificationMemory = {};

// Fonction utilitaire pour télécharger une image en Buffer sécurisé
async function getBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    return Buffer.from(response.data);
  } catch {
    return null;
  }
}

// Fonction pour dessiner un avatar circulaire proprement
async function drawAvatar(ctx, url, x, y, radius, fallbackLetter, fallbackBg) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const buffer = url ? await getBuffer(url) : null;
  if (buffer) {
    try {
      const img = await loadImage(buffer);
      ctx.drawImage(img, x, y, radius * 2, radius * 2);
      ctx.restore();
      return;
    } catch {}
  }

  // Rendu de secours si l'image échoue ou est absente
  ctx.fillStyle = fallbackBg;
  ctx.fillRect(x, y, radius * 2, radius * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${radius}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(fallbackLetter, x + radius, y + radius);
  ctx.restore();
}

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "14.0",
    author:"Camille Uchiha",
    countDown: 5,
    role: 2,
    category: "owner",
    shortDescription: "Broadcast Pro Canvas avec Avatars et Heure",
    longDescription: "Génère un Canvas professionnel incluant l'avatar de l'admin, du groupe et l'heure système.",
    guide: { en: `Usage: {pn} <message>` },
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, api, event, threadsData, envCommands, commandName, args }) {
    const { delayPerGroup = 400 } = envCommands[commandName] || {};
    const textToDraw = args.join(" ");
    if (!textToDraw) return message.reply(`[SYSTEM] ERREUR: Contenu du message vide.`);

    const cacheDir = path.join(__dirname, 'cache');
    const cachePath = path.join(cacheDir, `noti_pro_${Date.now()}.jpg`);
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // 1. Récupération des données de l'administrateur (Expéditeur)
    const adminID = event.senderID;
    let adminAvatarUrl = `https://facebook.com{adminID}/picture?width=200&height=200&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    let adminName = "Administrateur";
    try {
      const usersInfo = await api.getUserInfo(adminID);
      adminName = usersInfo[adminID]?.name || adminName;
    } catch {}

    // 2. Filtrer et lister les groupes cibles
    const allThreads = (await threadsData.getAll())
      .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    if (!allThreads.length) return message.reply(`[SYSTEM] INFO: Aucun groupe cible disponible.`);

    message.reply(`[SYSTEM] Génération et diffusion Pro Canvas en cours (${allThreads.length} groupes)...`);

    let sendSuccess = 0;
    const sendError = [];

    // 3. Boucle de traitement par groupe
    for (const thread of allThreads) {
      let groupName = thread.name || "Groupe sans nom";
      let groupAvatarUrl = null;

      try {
        const threadInfo = await api.getThreadInfo(thread.threadID);
        groupName = threadInfo.threadName || groupName;
        if (threadInfo.imageSrc) groupAvatarUrl = threadInfo.imageSrc;
      } catch {}

      // Obtenir l'heure exacte au format HH:MM
      const now = new Date();
      const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      try {
        // Dimensions du Canvas Pro (Format 16:9 Standard)
        const canvas = createCanvas(1200, 675);
        const ctx = canvas.getContext('2d');

        // Fond sombre stylisé avec dégradé subtil
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#0f141c');
        bgGradient.addColorStop(1, '#080b10');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dessin du conteneur principal à bords arrondis
        const boxX = 40, boxY = 40, boxW = canvas.width - 80, boxH = canvas.height - 80;
        ctx.fillStyle = "rgba(17, 22, 30, 0.9)";
        ctx.strokeStyle = "rgba(229, 26, 36, 0.8)"; // Ligne de contour écarlate
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        // --- SECTION ENTÊTE ---
        ctx.fillStyle = "#E51A24";
        ctx.font = "bold 32px sans-serif";
        ctx.fillText("▍ SYSTEM BROADCAST", boxX + 40, boxY + 65);

        // Heure d'envoi alignée à droite
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "26px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`Envoyé à ${timeString}`, boxX + boxW - 40, boxY + 65);
        ctx.textAlign = "left"; // Reset alignement

        // Ligne de séparation
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boxX + 40, boxY + 100);
        ctx.lineTo(boxX + boxW - 40, boxY + 100);
        ctx.stroke();

        // --- SECTION AVATARS DYNAMIQUES (Asynchrones et sécurisés) ---
        // Avatar Admin (Gauche)
        await drawAvatar(ctx, adminAvatarUrl, boxX + 40, boxY + 130, 45, adminName.charAt(0), "#3b5998");
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(adminName, boxX + 150, boxY + 170);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "18px sans-serif";
        ctx.fillText("Administrateur Système", boxX + 150, boxY + 200);

        // Avatar Groupe (Droite)
        const groupAvatarX = boxX + boxW - 130;
        await drawAvatar(ctx, groupAvatarUrl, groupAvatarX, boxY + 130, 45, groupName.charAt(0), "#1db954");
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(groupName, groupAvatarX - 20, boxY + 170);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "18px sans-serif";
        ctx.fillText("Groupe Destinataire", groupAvatarX - 20, boxY + 200);
        ctx.textAlign = "left"; // Reset

        // Deuxième ligne de séparation
        ctx.beginPath();
        ctx.moveTo(boxX + 40, boxY + 250);
        ctx.lineTo(boxX + boxW - 40, boxY + 250);
        ctx.stroke();

        // --- SECTION TEXTE PRINCIPAL (Gestion du Wrap Text Pro) ---
        ctx.fillStyle = "#EAEAEA";
        ctx.font = "30px sans-serif";
        
        const words = textToDraw.split(' ');
        let line = '';
        const lines = [];
        const maxWidth = boxW - 100;
        const lineHeight = 48;

        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        let textY = boxY + 320;
        for (let k = 0; k < lines.length; k++) {
          if (textY < boxY + boxH - 50) {
            ctx.fillText(lines[k], boxX + 50, textY);
            textY += lineHeight;
          }
        }

        // Écriture physique sur le disque
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
        fs.writeFileSync(cachePath, buffer);

        // Construction du formulaire Messenger
        const formSend = {
          body: `📢 **Alerte Système administratif**`,
          attachment: [
            fs.createReadStream(cachePath),
            ...await getStreamsFromAttachment([
              ...event.attachments,
              ...(event.messageReply?.attachments || [])
            ])
          ]
        };

        const sentMsg = await api.sendMessage(formSend, thread.threadID);
        sendSuccess++;
        notificationMemory[`${thread.threadID}_${sentMsg.messageID}`] = { groupName, threadID: thread.threadID };
        
        // Délai de temporisation pour éviter d'être banni par Facebook
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));

      } catch (err) {
        sendError.push({ threadID: thread.threadID, groupName, error: err.message });
      }
    }

    // Nettoyage rigoureux du cache
    setTimeout(() => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, 20000);

    let bilan = `[BILAN DIFFUSION ]\n🟢 Réussis: ${sendSuccess}\n🔴 Échecs: ${sendError.length}`;
    if (sendError.length) sendError.forEach(err => { bilan += `\n- ${err.groupName}: ${err.error}`; });
    message.reply(bilan.trim());
  },

  onMessage: async function({ api, event }) {
    if (!event.messageReply) return;

    const repliedMsgID = event.messageReply.messageID;
    const notificationKey = Object.keys(notificationMemory).find(key => key.endsWith(`_${repliedMsgID}`));
    if (!notificationKey) return;

    const { groupName, threadID } = notificationMemory[notificationKey];
    const userName = event.senderName || "Utilisateur";
    const userID = event.senderID;

    const adminMessage = `[REPONSE DETECTEE]\n👤 Expéditeur: ${userName} (ID: ${userID})\n👥 Groupe: ${groupName} (ID: ${threadID})\n\n💬 Message:\n${event.body || "Média joint"}\n\n---\n👉 Répondez à cette alerte pour envoyer votre message retour.`;

    const targetAdmin = global.config.ADMINBOT || event.senderID;
    api.sendMessage(adminMessage, targetAdmin);
  }
};


