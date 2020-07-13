// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const boosterCut = 20;
// webhook messages drops here (channel id)
const hookForm = "731543421340221521";
// routing to booster channel
const webhookToChannelId = "731523810662154311";

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
            { name: embed.fields[11].name, value: embed.fields[11].value, inline: true },
            // EMPTY AREA
            { name: '\u200B', value: '\u200B' }
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

// Webhook to embed message
client.on('message', async message => {
    // webhook-1 channel
    if (message.channel.id === hookForm) {
        // Is that message comes from webhook
        if (message.webhookID) {
            // Get webhook post
            var msg = (await message.fetch());
            // Get embeds on post
            var embed = new Discord.MessageEmbed(msg.embeds[0]);
            // modify embeds for advertise
            var newEmbed = modifyEmbed(embed);
            // Get channel with by Id
            //var messageToChannel = getChannelbyId(webhookToChannelId);
            // Send, new modified message to the specific channel
            try {
                //messageToChannel.send(newEmbed);
                client.channels.cache.get(webhookToChannelId).send(newEmbed);
            } catch (error) {
                console.log(newEmbed + " " + error);
            }
        }
    }
});

// Add react to Embed Message
client.on('message', message => {
    // Add react only specific channel
    if (message.channel.id === webhookToChannelId) {
        // Modify footer of message for boostId
        message.edit(message.embeds[0].setFooter('BoostId: ' + message.id, 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png'));

        // Add react to the message
        message.react('✅').then(() =>
            message.react('731617839290515516'), // DPS
            message.react('731617839596961832'), // TANK
            message.react('731617839370469446'));// HEALER
    }
});

var needDpsBooster = true;
var dpsBoosters = Array();
var dpsUsers = Array();
var tankBoosters = Array();
var tankUsers = Array();
var healerBoosters = Array();
var healerUsers = Array();

// ReactionAdd Event Listener
client.on('messageReactionAdd', async (reaction, user) => {
    const filter1 = (reaction, user) => {
        return ['731617839290515516']
            .includes(reaction.emoji.name) && user.id === message.author.id;
    };
    const filter2 = (reaction, user) => {
        return ['731617839596961832']
            .includes(reaction.emoji.name) && user.id === message.author.id;
    };
    const filter3 = (reaction, user) => {
        return ['731617839370469446']
            .includes(reaction.emoji.name) && user.id === message.author.id;
    };

    if (reaction.partial) {
        console.log(`Reaction is partial: ${reaction.partial}`);
        // If the message this reaction belongs to was removed the fetching 
        // might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }
    //get all users who reacted classes
    //var reactedDPSMember = (await reaction.users.fetch()).array();
    //var reactedTANKMember = (await reaction.users.fetch()).array();
    //var reactedHEALERMember = (await reaction.users.fetch()).array();

        // DPS Boosters
    if (reaction.emoji.id === '731617839290515516' && !user.bot) {
        if (!tankUsers.includes(user) && !healerUsers.includes(user)) {
            if (!dpsUsers.includes(user)) {
                // add booster to dpsUsers
                dpsUsers.push(user);
                //console.log(`Added to dpsUsers ${user.username}`);

                console.log('----------ALL DPS USERS----------');
                let i = 0;
                // Print all of dpsUsers registered queue
                dpsUsers.forEach(element => {
                    console.log(`${i}- DPS USER: ${element.username}#${element.discriminator}`);
                    i++;
                });
                console.log('----------------------------------');

                // Store all dpsBoosters players
                dpsBoosters.push(dpsUsers[0]);

                if (dpsBoosters.length == 1) {
                    let tmpMsg = (await reaction.message.fetch()).embeds[0];
                    let tmpEmbed = new Discord.MessageEmbed(tmpMsg);
                    
                    // modified embed message
                    tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
                    // send modified embed message
                    reaction.message.edit(tmpEmbed);
                    console.log(`DONE! BoostId= ${reaction.message.id} - @${user.username}#${user.discriminator} user got ${reaction.emoji.name} job!`);
                }
            }
        }
    }   // Tank Boosters
    else if (reaction.emoji.id === '731617839596961832' && !user.bot) {
        if (!dpsUsers.includes(user) && !healerUsers.includes(user)) {
            if (!tankUsers.includes(user)) {
                // add booster to tankUsers
                tankUsers.push(user);
                //console.log(`Added to tankUsers ${user.username}`);

                console.log('----------ALL TANK USERS----------');
                let i = 0;
                // Print all of tankUsers registered queue
                tankUsers.forEach(element => {
                    console.log(`${i}- TANK USER: ${element.username}#${element.discriminator}`);
                    i++;
                });
                console.log('----------------------------------');

                // Store all tankBoosters players
                tankBoosters.push(tankUsers[0]);

                if (dpsBoosters.length == 1) {
                    let tmpMsg = (await reaction.message.fetch()).embeds[0];
                    let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                    // modified embed message
                    tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });

                    reaction.message.edit(tmpEmbed);
                    console.log(`DONE! BoostId= ${reaction.message.id} - @${user.username}#${user.discriminator} user got ${reaction.emoji.name} job!`);
                }
            }
        }
    }  // Healer Boosters
    else if (reaction.emoji.id === '731617839370469446' && !user.bot) {
        if (!dpsUsers.includes(user) && !tankUsers.includes(user)) {
            if (!healerUsers.includes(user)) {
                // add booster to healerUsers
                healerUsers.push(user);
                //console.log(`Added to healerUsers ${user.username}`);

                console.log('--------ALL HEALER USERS---------');
                let i = 0;
                // Print all of healerUsers registered queue
                healerUsers.forEach(element => {
                    console.log(`${i}- HEALER USER: ${element.username}#${element.discriminator}`);
                    i++;
                });
                console.log('----------------------------------');

                // Store all dpsBoosters players
                healerBoosters.push(healerUsers[0]);

                if (healerBoosters.length == 1) {
                    let tmpMsg = (await reaction.message.fetch()).embeds[0];
                    let tmpEmbed = new Discord.MessageEmbed(tmpMsg);
                    
                    // modified embed message
                    tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });

                    reaction.message.edit(tmpEmbed);
                    console.log(`DONE! BoostId= ${reaction.message.id} - @${user.username}#${user.discriminator} user got ${reaction.emoji.name} job!`);
                }
            }
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    
    if (reaction.partial) {
        console.log(`Reaction is partial: ${reaction.partial}`);
        // If the message this reaction belongs to was removed the fetching 
        // might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // DPS Boosters
    if (reaction.emoji.id === '731617839290515516' && !user.bot) {
        if (dpsUsers.includes(user)) {
            // pop booster from dpsUsers
            try {
                let deletedUser = dpsUsers.shift();
                dpsBoosters.pop();
                console.log(`Deleted from dpsUsers and dpsBoosters ${deletedUser.username}`);
            } catch (error) {
                console.log(error + " DPS User cannot deleted!")
            }

            console.log('----------ALL DPS USERS----------');
            let i = 0;
            // Print all of dpsUsers registered queue
            dpsUsers.forEach(element => {
                console.log(`${i}- DPS USER: ${element.username}#${element.discriminator}`);
                i++;
            });
            console.log('----------------------------------');

            if (dpsBoosters.length == 0) {
                let tmpMsg = (await reaction.message.fetch()).embeds[0];
                let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                // which message will be deleting
                let temp = new Discord.MessageEmbed().fields;
                temp.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });

                // get id of which field wants delete
                let idx = tmpEmbed.fields.indexOf(temp[0]);
                // delete that field
                tmpEmbed.fields.splice(idx, 1);
                // edit the message with the new one
                reaction.message.edit(tmpEmbed);
                console.log(`DELETED DONE! BoostId= ${reaction.message.id} - @${user.username}#${user.discriminator} user got ${reaction.emoji.name} job!`);
            }
        }
    } // Tank Boosters
    else if (reaction.emoji.id === '731617839596961832' && !user.bot) {
        if (tankUsers.includes(user)) {
            // pop booster from tankUsers
            try {
                let deletedUser = tankUsers.shift();
                tankBoosters.pop();
                console.log(`Deleted from tankUsers and tankBoosters ${deletedUser.username}`);
            } catch (error) {
                console.log(error + " TANK User cannot deleted!")
            }

            console.log('----------ALL TANK USERS----------');
            let i = 0;
            // Print all of tankUsers registered queue
            tankUsers.forEach(element => {
                console.log(`${i}- TANK USER: ${element.username}#${element.discriminator}`);
                i++;
            });
            console.log('----------------------------------');

            if (tankBoosters.length == 0) {
                let tmpMsg = (await reaction.message.fetch()).embeds[0];
                let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                // which message will be deleting
                let temp = new Discord.MessageEmbed().fields;
                temp.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });

                // get id of which field wants delete
                let idx = tmpEmbed.fields.indexOf(temp[0]);
                // delete that field
                tmpEmbed.fields.splice(idx, 1);
                // edit the message with the new one
                reaction.message.edit(tmpEmbed);
                console.log(`DELETED DONE! BoostId= ${reaction.message.id} - @${user.username}#${user.discriminator} user got ${reaction.emoji.name} job!`);
            }
        }
    } // Healer Boosters
    else if (reaction.emoji.id === '731617839370469446' && !user.bot) {
        if (healerUsers.includes(user)) {
            // pop booster from healerUsers
            try {
                let deletedUser = healerUsers.shift();
                healerBoosters.pop();
                console.log(`Deleted from healerUsers and healerBoosters ${deletedUser.username}`);
            } catch (error) {
                console.log(error + " HEALER User cannot deleted!")
            }

            console.log('----------ALL HEALER USERS----------');
            let i = 0;
            // Print all of healerUsers registered queue
            healerUsers.forEach(element => {
                console.log(`${i}- HEALER USER: ${element.username}#${element.discriminator}`);
                i++;
            });
            console.log('----------------------------------');

            if (healerBoosters.length == 0) {
                let tmpMsg = (await reaction.message.fetch()).embeds[0];
                let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                // which message will be deleting
                let temp = new Discord.MessageEmbed().fields;
                temp.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });

                // get id of which field wants delete
                let idx = tmpEmbed.fields.indexOf(temp[0]);
                // delete that field
                tmpEmbed.fields.splice(idx, 1);
                // edit the message with the new one
                reaction.message.edit(tmpEmbed);
                console.log(`DELETED DONE! BoostId= ${reaction.message.id} - @${user.username}#${user.discriminator} user got ${reaction.emoji.name} job!`);
            }
        }
    }
});