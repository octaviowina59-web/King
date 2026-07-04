module.exports = {
    config: {
        name: "infogc",
        version: "1.0.1",
        author: "Camille uchiha", // Votre nom est bien enregistré ici
        countDown: 5,
        role: 0, 
        description: {
            vi: "Xem thông tin chi tiết về nhóm chat",
            en: "View detailed information about the chat group"
        },
        category: "box chat",
        guide: {
            vi: "   {pn}",
            en: "   {pn}"
        }
    },

    onStart: async function ({ api, message, event }) {
        try {
            // 1. Récupération des données du groupe
            const threadInfo = await api.getThreadInfo(event.threadID);
            
            // 2. Extraction des données
            const threadName = threadInfo.threadName || "Groupe sans nom";
            const memberCount = threadInfo.participantIDs.length;
            const adminCount = threadInfo.adminIDs.length;
            const isGroup = threadInfo.isGroup;

            if (!isGroup) {
                return message.reply("⚠️ Cette commande ne peut être utilisée que dans un groupe de discussion.");
            }

            // 3. Comptage des genres
            let males = 0;
            let females = 0;
            let unknown = 0;

            for (const user of threadInfo.userInfo) {
                if (user.gender === "MALE") males++;
                else if (user.gender === "FEMALE") females++;
                else unknown++;
            }

            // 4. Construction du rapport final
            const infoMessage = 
                `📊 ═[ 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡𝗦 𝗗𝗨 𝗚𝗥𝗢𝗨𝗣𝗘 ]═ 📊\n\n` +
                `📝 𝗡𝗼𝗺 : ${threadName}\n` +
                `🆔 𝗜𝗗 𝗚𝗿𝗼𝘂𝗽𝗲 : ${event.threadID}\n` +
                `👥 𝗠𝗲𝗺𝗯𝗿𝗲𝘀 : ${memberCount} utilisateurs\n` +
                `👑 𝗔𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗲𝘂𝗿𝘀 : ${adminCount}\n\n` +
                `📈 📊 𝗗𝗲́𝘁𝗮𝗶𝗹𝘀 𝗱𝗲𝘀 𝗽𝗿𝗼𝗳𝗶𝖑𝘀 :\n` +
                `🙋‍♂️ Hommes : ${males}\n` +
                `🙋‍♀️ Femmes : ${females}\n` +
                `❓ Non spécifiés : ${unknown}\n\n` +
                `🎨 𝗘𝗺𝗼𝗷𝗶 𝗽𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹 : ${threadInfo.emoji || "👍"}\n\n` +
                `✨ 𝗖𝗿𝗲́𝗲́ 𝗽𝗮𝗿 : Camille uchiha`;

            return message.reply(infoMessage);

        } catch (error) {
            return message.reply("❌ Impossible de récupérer les détails du groupe pour le moment.");
        }
    }
};


