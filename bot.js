// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const embed = new Discord.MessageEmbed();

client.login(process.env.DISCORD_TOKEN);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    // Command line
    if(embed.title === 'Need Dungeon Booster!'){
        console.log("New post!");
    }

    if(message.content === 'Need'){
        console.log(message.content + ' catched');

        message.react('✅').then(() => message.react('❌'));

        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        message.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '✅') {
                    message.reply('you reacted with a thumbs up.');
                } else {
                    message.reply('you reacted with a thumbs down.');
                }
            })
            .catch(collected => {
                message.reply('you reacted with neither a thumbs up, nor a thumbs down.');
            });

    } else if(message.content === 'Dungeon'){
        console.log(message.content + ' catched');
    }

    
});



