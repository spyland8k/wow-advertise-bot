// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const webhook = require('webhook-discord');
const client = new Discord.Client();

function hookedMsg(){

}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    };
    // is that message comes from webhook
    // 731232365388759111
    if(message.webhookID){
        var channel = message.channel;
        //get webhook post
        var msg = (await message.fetch());
        console.log(msg + "fetched message");

        var embed = new Discord.MessageEmbed(msg.embeds[0]);
        console.log(embed + "embed message");

        var exEmbed = new Discord.MessageEmbed(embed)
            .setTitle("TESTER")
            .setDescription("TEST description");

        channel.send(exEmbed);
        console.log(exEmbed + " embed[" + "0" + "] name");

        msg.react('✅').then(() => message.react('❌'));

        msg.awaitReactions(filter, { max: 1, time: 5000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '✅') {
                    msg.reply('you reacted with a thumbs up.');
                } else {
                    msg.reply('you reacted with a thumbs down.');
                }
            })
            .catch(collected => {
                msg.reply('you reacted with neither a thumbs up, nor a thumbs down.');
            });
    }

    // Command line
    if(message.content === 'Need'){
        console.log(message.content + ' catched');

        message.react('✅').then(() => message.react('❌'));

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


client.login(process.env.DISCORD_TOKEN);