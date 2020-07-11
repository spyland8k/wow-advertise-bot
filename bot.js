// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
const boosterCut = 20;
// webhook messages drops here (channel id)
const hookForm = "731543421340221521";
// routing to booster channel
const webhookToChannelId = "731232365388759111";

client.login(process.env.DISCORD_TOKEN);

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getChannelbyId(channelId) {
    return client.channels.cache.get(channelId);
}

function modifyEmbed(embed) {
    /*// What are those coming from webhook
    console.log(embed.title + " embed message");
    let i = 0;
    embed.fields.forEach(element => {
        console.log(i + "- " + element.name + " " + element.value);
        i++;
    });*/

    // Modify hooked message from webhook channel
    var newEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(embed.title)
        //.setDescription('Some description here')
        .setThumbnail('https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png')
        // TODO Generic list
        .addFields(
            // Discord Tag
            //{ name: embed.fields[0].name, value: embed.fields[0].value, inline: true },
            // Faction
            { name: embed.fields[1].name, value: embed.fields[1].value, inline: true },
            // Keystone Level
            { name: embed.fields[2].name, value: embed.fields[2].value, inline: true },
            // Dungeon Key
            { name: embed.fields[3].name, value: embed.fields[3].value, inline: true },
            // Armor Stacked
            { name: embed.fields[4].name, value: embed.fields[4].value, inline: true },
            // Number Of Boost
            { name: embed.fields[5].name, value: embed.fields[5].value, inline: true },
            // Boost Price
            { name: embed.fields[6].name, value: embed.fields[6].value, inline: true },
            // TODO Booster Cut
            { name: "Booster Cut", value: toString(parseFloat(embed.fields[6].value) / boosterCut), inline: true },
            // Realm
            { name: embed.fields[7].name, value: embed.fields[7].value, inline: true },
            // Char to Whisper /w %nick
            { name: embed.fields[8].name, value: embed.fields[8].value, inline: true },
            // Note
            { name: embed.fields[11].name, value: embed.fields[11].value, inline: true }
        )
        //.addField('Inline field title', 'Some value here', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('BoostId: ', 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png');
    return newEmbed
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    // Is that message comes from webhook
    if (message.webhookID) {
        // Get webhook post
        var msg = (await message.fetch());
        // Get embeds on post
        var embed = new Discord.MessageEmbed(msg.embeds[0]);
        // modify embeds for advertise
        var newEmbed = modifyEmbed(embed);
        // Get channel with by Id
        var messageToChannel = getChannelbyId(webhookToChannelId);
        // Send, new modified message to the specific channel
        try {
            messageToChannel.send(newEmbed);
        } catch (error) {
            console.log(newEmbed + " " + error);   
        }
    }
});

/*
client.on('message', message => {
    // TODO Prefix command
    if (message.content === 'Need Dungeon Booster!') {
        const filter1 = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const filter2 = (reaction, user) => {
            return reaction.emoji.name === '✅', '❌' && user.id === message.author.id;
        };

        console.log(message.content + ' catched');

        message.react('✅').then(() => message.react('❌'));

        // time cooldown for advertise
        const collector = message.createReactionCollector(filter2, { time: 15000 });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });

    }
});*/

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.emoji.name === '✅') {
        console.log(reaction.users);
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.emoji.name === '✅') {
        console.log(reaction.users);
    }
});
