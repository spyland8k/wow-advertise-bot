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
            { name: 'BOOSTERS', value: '\u200B' }
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
var boosterList = Array();

async function addDps(reaction, user) {
    if (!tankUsers.includes(user) && !healerUsers.includes(user)) {
        if(dpsBoosters.length == 0){
            user = dpsUsers[0];
            // Get first user in dpsUsers
            dpsBoosters.push(user);

            // Print all of dpsUsers registered queue
            let i = 0;
            console.log('----------ALL DPS USERS----------');
            dpsUsers.forEach(element => {
                console.log(`${i}- ALL DPS: ${element.username}#${element.discriminator}`);
                i++;
            });
            console.log('----------------------------------');

            if (dpsBoosters.length == 1) {
                let tmpMsg = (await reaction.message.fetch()).embeds[0];
                let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                // Modified embed message
                tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
                // Send modified embed message
                reaction.message.edit(tmpEmbed);
            }
        }
    }
}
async function addTank(reaction, user) {
    if (!dpsUsers.includes(user) && !healerUsers.includes(user)) {
        if (tankBoosters.length == 0) {
            // Get first user in tankBoosters
            tankBoosters.push(tankUsers[0]);

            // Print all of tankUsers registered queue
            let i = 0;
            console.log('----------ALL TANK USERS----------');
            tankUsers.forEach(element => {
                console.log(`${i}- Booster TANK: ${element.username}#${element.discriminator}`);
                i++;
            });
            console.log('----------------------------------');

            if (tankBoosters.length == 1) {
                let tmpMsg = (await reaction.message.fetch()).embeds[0];
                let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                // modified embed message
                tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });

                reaction.message.edit(tmpEmbed);
            }
        }
    }
}
async function addHealer(reaction, user) {
    if (!dpsUsers.includes(user) && !tankUsers.includes(user)) {
        if (healerBoosters.length == 0) {
            // Get first user in healerBoosters
            healerBoosters.push(healerUsers[0]);

            // Print all of healerUsers registered queue
            console.log('--------ALL HEALER USERS---------');
            let i = 0;
            healerUsers.forEach(element => {
                console.log(`${i}- HEALER USER: ${element.username}#${element.discriminator}`);
                i++;
            });
            console.log('----------------------------------');

            if (healerBoosters.length == 1) {
                let tmpMsg = (await reaction.message.fetch()).embeds[0];
                let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                // modified embed message
                tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });

                reaction.message.edit(tmpEmbed);
            }
        }
    }
}

/*async function removeDps(reaction, user) {
    if (dpsUsers.includes(user)) {
        // Remove the first user from dpsBoosters
        let tmpDpsBooster = dpsBoosters.shift();
        // Reassign booster
        let tmpDpsUserLength = dpsUsers.length;
        // Remove the first user from dpsUsers queue, who user got DPS USER
        dpsUsers.shift();

        // print all Users at dpsUsers after removed
        if(dpsUsers.length >= 0){
            console.log('----------AFTER DPS USERS----------');
            let i = 0;
            // Print all of dpsUsers registered queue
            dpsUsers.forEach(element => {
                console.log(`${i}- CURRENT DPS: ${element.username}#${element.discriminator}`);
                i++;
            });
            console.log('----------------------------------');
        }
        
        if (dpsBoosters.length == 0) {
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps:731617839290515516>', value: `<@${tmpDpsBooster.id}>`, inline: true });

            try {
                let i = 0;
                //console.log(`Delete ${temp[0].name}-${temp[0].value}`);
                tmpEmbed.fields.forEach(function (field) {
                    //console.log(`Field[${i}] ${field.name}-${field.value} in ARRAY`);
                    if (field.name == temp[0].name) {
                        //console.log(`Field[${i}] exist DPS`);
                        let idx = tmpEmbed.fields.indexOf(field);
                        // delete that field
                        tmpEmbed.fields.splice(idx, 1);
                        //console.log(`[${i}] Dps User: ${user.username}#${user.discriminator} successfully removed!`)
                    }
                    i++;
                });
            }
            catch (error) {
                console.log(`Dps User: ${tmpDpsBooster.username}#${tmpDpsBooster.discriminator} cannot removed!`)
            }
            // new modified message
            reaction.message.edit(tmpEmbed);

            if(dpsUsers.length >= 0){
                // if there is any dpsUser queue
                if (dpsUsers.length == tmpDpsUserLength--) {
                    // Get first user in dpsUsers
                    dpsBoosters.push(dpsUsers[0]);
                    let tmpUser = dpsBoosters[0];

                    if (dpsBoosters.length == 1) {
                        let tmpMsg = (await reaction.message.fetch()).embeds[0];
                        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);
                        // Modified embed message
                        tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${tmpUser[0].id}>`, inline: true });
                        // Send modified embed message
                        reaction.message.edit(tmpEmbed);
                    }
                }
            }
        }
    }
}*/

async function removeDps(reaction, user){
    if (dpsUsers.includes(user)){
        let tmpUser = user;
        let newUser = dpsUsers[0];

        // delete current user
        if(dpsBoosters.length == 1){
            let tmpMsg = (await reaction.message.fetch()).embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });

            try {
                let i = 0;
                //console.log(`Delete ${temp[0].name}-${temp[0].value}`);
                tmpEmbed.fields.forEach(function (field) {
                    //console.log(`Field[${i}] ${field.name}-${field.value} in ARRAY`);
                    if (field.name == temp[0].name) {
                        //console.log(`Field[${i}] exist DPS`);
                        let idx = tmpEmbed.fields.indexOf(field);
                        // delete that field
                        tmpEmbed.fields.splice(idx, 1);
                        //console.log(`[${i}] Dps User: ${user.username}#${user.discriminator} successfully removed!`)
                    }
                    i++;
                });
            }
            catch (error) {
                console.log(`Dps User: ${user.username}#${user.discriminator} cannot removed!`)
            }
            // new modified message
            reaction.message.edit(tmpEmbed);
            
            // remove user from dpsBooster
            dpsBoosters.shift();
            // remove user from dpsUsers
            dpsUsers.shift();

            // add first user at dpsUser queue
            if(dpsUsers.length > 0){
                await addDps(reaction, dpsUsers[0]);
            }
        }
    }
}

async function removeTank(reaction, user) {
    if (tankUsers.includes(user)) {
        try {
            // pop booster from tankUsers
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

            // get id of which field wants delete, then delete
            //let idx = tmpEmbed.fields.indexOf(temp[0]);
            //tmpEmbed.fields.splice(idx, 1);

            try {
                let i = 0;
                tmpEmbed.fields.forEach(function (field) {
                    console.log(`Field[${i}] ${field.name}-${field.value} in ARRAY`);
                    if (field.name == temp[0].name) {
                        console.log(`Field[${i}] exist TANK`);
                        let idx = tmpEmbed.fields.indexOf(field);
                        // delete that field
                        tmpEmbed.fields.splice(idx, 1);
                        console.log(`[${i}] Tank User: ${user.username}#${user.discriminator} successfully removed!`)
                    }
                    i++;
                });
            }
            catch (error) {
                console.log(`Tank User: ${user.username}#${user.discriminator} cannot removed!`)
            }

            // edit the message with the new one
            reaction.message.edit(tmpEmbed);
        }
    }
}
async function removeHealer(reaction, user) {
    if (healerUsers.includes(user)) {
        try {
            // pop booster from healerUsers
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

            // get id of which field wants delete, then delete
            //let idx = tmpEmbed.fields.indexOf(temp[0]);
            //tmpEmbed.fields.splice(idx, 1);

            try {
                let i = 0;
                console.log(`Delete ${temp[0].name}-${temp[0].value}`);
                tmpEmbed.fields.forEach(function (field) {
                    console.log(`Field[${i}] ${field.name}-${field.value} in ARRAY`);
                    if (field.name == temp[0].name) {
                        console.log(`Field[${i}] exist HEALER`);
                        let idx = tmpEmbed.fields.indexOf(field);
                        // delete that field
                        tmpEmbed.fields.splice(idx, 1);
                        console.log(`[${i}] Healer User: ${user.username}#${user.discriminator} successfully removed!`)
                    }
                    i++;
                });
            }
            catch (error) {
                console.log(`Dps User: ${user.username}#${user.discriminator} cannot removed!`)
            }
            // edit the message with the new one
            reaction.message.edit(tmpEmbed);
        }
    }
}

client.on('messageReactionAdd', async (reaction, user) => {
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

    // DPS Queue
    if (reaction.emoji.id === '731617839290515516' && !user.bot) {
        // if reacted user does not exist in dpsUsers
        if (!dpsUsers.includes(user)) {
            dpsUsers.push(user);
            await addDps(reaction, dpsUsers[0]);
        }
    }   // Tank Queue
    else if (reaction.emoji.id === '731617839596961832' && !user.bot) {
        // if reacted user does not exist in tankUsers
        if (!tankUsers.includes(user)) {
            tankUsers.push(user);
            await addTank(reaction, tankUsers[0]);
        }
    }  // Healer Queue
    else if (reaction.emoji.id === '731617839370469446' && !user.bot) {
        // if reacted user does not exist in healerUsers
        if (!healerUsers.includes(user)) {
            healerUsers.push(user);
            await addHealer(reaction, healerUsers[0]);
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
        await removeDps(reaction, user);
    } // Tank Boosters
    else if (reaction.emoji.id === '731617839596961832' && !user.bot) {
        await removeTank(reaction, user);
    } // Healer Boosters
    else if (reaction.emoji.id === '731617839370469446' && !user.bot) {
        await removeHealer(reaction, user);
    }
});