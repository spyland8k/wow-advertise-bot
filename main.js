// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const boosterCut = 20;
// webhook messages drops here (channel id)
const webhookFromChannelId = "731543421340221521";
// routing to booster channel
const webhookToChannelId = "731523810662154311";

client.login(process.env.DISCORD_TOKEN);

class Advertise {
    _message;
    _advertiser;

    // when advertise full
    _isFull;
    // when advertise done
    _isComplete;
    // when advertise canceled
    _isCanceled;

    _isDpsKey;
    _dpsUsers;
    _dpsBoosters;

    _isDps2Key;
    _dps2Users;
    _dps2Boosters;

    _isTankKey;
    _tankUsers;
    _tankBoosters;

    _isHealerKey;
    _healerUsers;
    _healerBoosters;

    constructor(message, advertiser, isFull, isComplete, isCanceled, 
            isDpsKey, dpsUsers, dpsBoosters, 
            isTankKey, tankUsers, tankBoosters, 
            isHealerKey, healerUsers, healerBoosters, 
            isDps2Key, dps2Users, dps2Boosters) {
        this._message = message
        this._advertiser = advertiser;
        this._isFull = isFull;
        this._isComplete = isComplete;
        this._isCanceled = isCanceled;
        
        this._isDpsKey = isDpsKey;
        this._dpsUsers = dpsUsers;
        this._dpsBoosters = dpsBoosters;

        this._isDps2Key = isDps2Key;
        this._dps2Users = dps2Users;
        this._dps2Boosters = dps2Boosters;

        this._isTankKey = isTankKey;
        this._tankUsers = tankUsers;
        this._tankBoosters = tankBoosters;

        this._isHealerKey = isHealerKey;
        this._healerUsers = healerUsers;
        this._healerBoosters = healerBoosters;
    }
}

async function newAdvertise(message, advertiser, isFull, isComplete, isCanceled, isDpsKey = false, isDps2Key = false, isTankKey = false, isHealerKey = false) {
    let dpsBoosters = Array();
    let dpsUsers = Array();
    let tankBoosters = Array();
    let tankUsers = Array();
    let healerBoosters = Array();
    let healerUsers = Array();
    let dps2Boosters = Array();
    let dps2Users = Array();

    let adv = new Advertise(message, advertiser, isFull, isComplete, isCanceled, 
        isDpsKey, dpsUsers, dpsBoosters, 
        isTankKey, tankUsers, tankBoosters, 
        isHealerKey, healerUsers, healerBoosters, 
        isDps2Key, dps2Users, dps2Boosters);

    MessageList.push(adv);
    return adv;
}

var MessageList = Array();
var isAdvertiserDps = Boolean(false);
var isAdvertiserTank = Boolean(false);
var isAdvertiserHealer = Boolean(false);
var isAdvertiserKey = Boolean(false);


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

async function modifyWebhook(embed) {
    // Modify hooked message from webhook channel
    var newEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(embed.title)
        //.setDescription('Some description here')
        .setThumbnail('https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png')
        //.addField('Inline field title', 'Some value here', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('BoostId: ', 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png');
    
        
    embed.fields.forEach(function(item, index, arr) {
        if(item.name === 'Discord Tag'){
            let users = client.guilds.cache.map(g => g.members.cache.map(u => u.user));

            // Find advertiser in guild members
            users[0].forEach( u => {
                if(u.tag == item.value)
                    newEmbed.addField('Advertiser', `<@${u.id}>`, true);
            });
        }
        else if(item.name === 'Boost Price'){
            newEmbed.addField(item.name, item.value, true);
            newEmbed.addField(`Booster Cut %${boosterCut}`, (Math.round(parseInt(item.value)/boosterCut)), true);
        }
        else if (item.name === 'Are you gonna join the boost?'){
            if (item.value === 'Yes'){
                let next1 = arr[index + 1];
                let next2 = arr[index + 2];
                // Tank/Dps/Healer
                if (next1.name == 'Which class do you wanna join the boost?') {
                    if (next1.value == 'Dps'){
                        isAdvertiserDps = true;
                    }else if(next1.value == 'Tank'){
                        isAdvertiserTank = true;
                    }else if(next1.value == 'Healer'){
                        isAdvertiserHealer = true;
                    }
                }
                if (next2.name === 'Do you have the key?'){
                    if(next2.value == 'Yes'){
                        isAdvertiserKey = true;
                    }
                }
            }
        }// Exclusion filter
        else if (!(item.name === 'Discord Tag') 
                && !(item.name === 'Boost Price') 
                && !(item.name === 'Are you gonna join the boost?')
                && !(item.name === 'Which class do you wanna join the boost?')
                && !(item.name === 'Do you have the key?')){
            newEmbed.addField(item.name, item.value, true);
        }
    })
    // BOOSTER AREA
    newEmbed.addField('BOOSTERS', '\u200B');

    return newEmbed
}

client.on('ready', async () => {
    console.log(`Bot started NOW! - ${new Date().toLocaleString()}`);
    try {
        // Get specific channel informations
        //var channel = await client.channels.cache.get(webhookToChannelId).fetch().then((msg) => msg.map( m => m));
        var channel = await client.channels.cache.get(webhookToChannelId).fetch();
        // Get all old messages
        var messages = await channel.messages.fetch().then((msg) => msg.map(m => m));

        //var guild = await client.guilds.cache.get('731232364826722395');
        //var guildUsers = guild.members.cache.get();


        // Fetch all of old messages cache at MessageList
        if( !(messages == null) ){
            // Able to use await functions
            for (const m of messages) {
                 
                // If advertise removed dont store
                if (!(m.title === 'Advertise Removed!')) {

                    for (const field of m.embeds[0].fields) {
                        if (field.name == 'Advertiser') {
                            //let addUser = m.guild.members.cache.get(regexId);
                            let regexId = field.value.replace(/\D/g, "");
                            // Return user with by ID
                            let advertiser = await client.users.fetch(regexId);
                            var createdAdvertise = await newAdvertise(m, advertiser, false, false, false,);
                            console.log(`Advertise id: ${m.id} not in cache, then cached!`);
                        } else if (field.name === '<:dps:731617839290515516>') {
                            //let addUser = m.guild.members.cache.get(regexId);
                            let regexId = field.value.replace(/\D/g, "");
                            // Return user with by ID
                            let user = await client.users.fetch(regexId);
                            createdAdvertise._dpsBoosters.push(user);
                            createdAdvertise._dpsUsers.push(user);
                        } else if (field.name === '<:dps2:732689305805520919>') {
                            let regexId = field.value.replace(/\D/g, "");
                            // Return user with by ID
                            let user = await client.users.fetch(regexId);
                            createdAdvertise._dps2Boosters.push(user);
                            createdAdvertise._dps2Users.push(user);
                        } else if (field.name === '<:tank:731617839596961832>') {
                            let regexId = field.value.replace(/\D/g, "");
                            // Return user with by ID
                            let user = await client.users.fetch(regexId);
                            createdAdvertise._tankBoosters.push(user);
                            createdAdvertise._tankUsers.push(user);
                        } else if (field.name === '<:healer:731617839370469446>') {
                            let regexId = field.value.replace(/\D/g, "");
                            // Return user with by ID
                            let user = await client.users.fetch(regexId);
                            createdAdvertise._healerBoosters.push(user);
                            createdAdvertise._healerUsers.push(user);
                        }
                    }
                    // TODO old messages reactions must be deleted
                    //m.reactions.remove(message.author.id);
                }
            }
        }
    } catch (error) {
        console.log(`ERROR while bot starting fetching old messages: ${error}`);
    }

    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', async message => {
    // When webhook come get this message, then modify and send webhookToChannelId
    if (message.channel.id === webhookFromChannelId && message.author.bot) {
        // Is that message comes from webhook
        // Get webhook post
        var msg = (await message.fetch());
        // Get embeds on post
        var embed = new Discord.MessageEmbed(msg.embeds[0]);
        // modify embeds for advertise
        var newEmbed = await modifyWebhook(embed);
        // Send, new modified message to the specific channel
        try {
            /*
            const editEmbed = new Discord.MessageEmbed().addField()
                .setDescription('this is the old description')
                .addField({});

            client.channels.cache.get(webhookToChannelId)
                            .send(newEmbed).then((m) =>
                                m.edit(newEmbed.setTitle(`NABERRR`)));*/
            await client.channels.cache.get(webhookToChannelId).send(newEmbed);         
        } catch (error) {
            console.log("WEBHOOK POST ERROR: " + error);
        }
    }
 
    if(message.channel.id === webhookToChannelId && message.author.bot){
        // Add boostId for MessageId 
        //message.embeds[0].setFooter('BoostId: ' + message.id, 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png');
        await message.edit(message.embeds[0].setFooter('BoostId: ' + message.id, 'https://bnetcmsus-a.akamaihd.net/cms/template_resource/fh/FHSCSCG9CXOC1462229977849.png'));

        // Get advertiser from posted message
        let advertiserId = message.embeds[0].fields[0].value.replace(/\D/g, "");
        // Return user with by ID
        let advertiser = await client.users.fetch(advertiserId);

        let newAdvertise = await newAdvertise(message, advertiser, false, false, false);
        // Add to the list new created advertise
        MessageList.unshift(newAdvertise);
        
        // Search at MessageList bofere created advertise
        var advertise = await MessageList.find(x => x._message.id == message.id);

        // Check the is any key priority
        if (isAdvertiserDps){
            if(isAdvertiserKey){
                await addDps(advertise, advertiser);
                advertise._isDpsKey = true;
                isAdvertiserKey = false;
            }
            await addDps(advertise, advertiser);
            advertise._isDpsKey = false;
            isAdvertiserDps = false; 
        }else if (isAdvertiserHealer){
            addHealer(advertise, advertiser);
        }else if(isAdvertiserTank){
            addTank(advertise, advertiser);
        }
        
        
        // Add react to the message
        await message.react('✅').then(() =>
            message.react('732689305805520919'), // DPS-2
            message.react('731617839290515516'), // DPS
            message.react('731617839596961832'), // TANK
            message.react('731617839370469446')) // HEALER
    }
});


async function addDps(advertise, user) {
    //var user = advertise._dpsUsers[0];
    var message = advertise._message;

    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addTank(advertise, user) {
    //var user = advertise._user;
    var message = advertise._message;
    if (!advertise._dpsUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dps2Users.includes(user)) {
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:tank:731617839596961832>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addHealer(advertise, user) {
    //var user = advertise._user;
    var message = advertise._message;
    if (!advertise._dpsUsers.includes(user) && !advertise._tankUsers.includes(user) && !advertise._dps2Users.includes(user)) {
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);
            //boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._dpsUsers.includes(user) && !advertise._tankBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        // TODO Might give error when, healer and dps in same user.
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addDps2(advertise, user) {
    //var user = advertise._user;
    var message = advertise._message;
    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dpsUsers.includes(user)) {
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            // TODO might be problem here
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps2:732689305805520919>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dps2Boosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        // TODO Might give error when, dps and tank in same user.
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);
            //advertise._boosterList.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            tmpEmbed.fields.push({ name: '<:dps2:732689305805520919>', value: `<@${user.id}>`, inline: true });
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function removeDps(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._dpsUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._dpsBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps:731617839290515516>', value: `<@${user.id}>`, inline: true });

            for (let i = 0; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

            // Remove user from dpsBooster
            let tmpUser = advertise._dpsBoosters.shift();
            // Remove user from dpsUsers
            // Find in healer user shifted healer booster
            // Delete tmpUser from dpsUsers
            let idx = advertise._dpsUsers.indexOf(tmpUser);
            if (idx > -1) {
                advertise._dpsUsers.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = advertise._boosterList.indexOf(tmpUser);
            if (idx > -1) {
                advertise._boosterList.splice(idx, 1);
            }*/

            // Add first user at dpsUser queue
            // TODO Send who is waiting dps queue
            if (advertise._dpsUsers.length > 0) {
                await addDps(advertise, advertise._dpsUsers[0]);
            }

            // If user choosed another reactions when release dps then add to him
            if (advertise._tankUsers.includes(user) && advertise._tankBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._healerUsers.includes(user)) {
                    await addTank(advertise, user);
                }
            }
            // If user choosed another reactions when release healer then add to him

            if (advertise._healerUsers.includes(user) && advertise._healerBoosters.length == 0) {
                // Check the user is in another emote
                if (!advertise._tankUsers.includes(user)) {
                    await addHealer(advertise, user);
                }
            }

            if (advertise._tankUsers.includes(user) && advertise._healerUsers.includes(user)) {
                if (advertise._tankBoosters.length == 0 && advertise._healerBoosters.length == 0) {
                    await addHealer(advertise, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (advertise._dpsUsers.length > 0) {
            advertise._dpsUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeTank(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._tankUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._tankBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:tank:731617839290515516>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

            // Remove user from tankBooster
            let tmpUser = advertise._tankBoosters.shift();
            // Remove user from tankBooster 
            // Find in healer user shifted healer booster
            // Delete tmpUser from tankUsers
            let idx = advertise._tankUsers.indexOf(tmpUser);
            if (idx > -1) {
                advertise._tankUsers.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = advertise._boosterList.indexOf(tmpUser);
            if (idx > -1) {
                advertise._boosterList.splice(idx, 1);
            }*/

            // Add first user at tankUser queue
            if (advertise._tankUsers.length > 0) {
                await addTank(advertise, advertise._tankUsers[0]);
            }

            // User select DPS or DPS2
            if(advertise._dpsUsers.includes(user) || advertise._dps2Users.includes(user)){
                // Also selected 3rd HEALER
                if(advertise._healerUsers.includes(user) && advertise._healerBoosters.length == 0){
                    await addHealer(advertise, user);
                }

                // Which one is closer to the queue
                // Select one of them DPS-DPS2
                if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0){
                    await addDps(advertise, user);
                } else if(advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0){
                    await addDps2(advertise, user);
                } 
            }// User select DPS AND DPS2
            if (advertise._dpsUsers.includes(user) && advertise._dps2Users.includes(user)) {
                if (advertise._dpsUsers.indexOf(user) <= advertise._dps2Users.indexOf(user)) {
                    if (advertise._dpsBoosters.length == 0)
                        await addDps(advertise, user);
                } else {
                    if (advertise._dps2Boosters.length == 0){
                        await addDps2(advertise, user);
                        //advertise._message.reaction.remove(user);
                    }
                        
                }
            }
            else if (advertise._healerUsers.includes(user)){
                if (advertise._healerBoosters.length == 0) {
                    await addHealer(advertise, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (advertise._tankUsers.length > 0) {
            advertise._tankUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeHealer(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._healerUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._healerBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:healer:731617839370469446>', value: `<@${user.id}>`, inline: true });

            for (let i = 9; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

            // Remove user from healerBooster
            let tmpUser = advertise._healerBoosters.shift();
            // Remove user from healerUsers 
            // Find in healer user shifted healer booster
            // Delete tmpUser from healerusers
            let idx = advertise._healerUsers.indexOf(tmpUser);
            if (idx > -1) {
                advertise._healerUsers.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = boosterList.indexOf(tmpUser);
            if (idx > -1) {
                boosterList.splice(idx, 1);
            }*/

            // Add first user at healerUser waiting at queue
            if (advertise._healerUsers.length > 0) {
                await addHealer(advertise, advertise._healerUsers[0]);
            }

            // If user select TANK
            if(advertise._tankUsers.includes(user)){
                // If user select TANK AND DPS/DPS2 prefer DPS/DPS2
                if(advertise._dpsUsers.includes((user) || advertise._dps2Users.includes(user))){
                    if(advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0){
                        await addDps(advertise, user);
                    }
                    else if (advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0) {
                        await addDps2(advertise, user);
                    }
                }
                else {
                    if (!advertise._dpsUsers.includes(user) || !advertise._dps2Users.includes(user)) {
                        if (advertise._tankBoosters.length == 0 && advertise._dpsBoosters.length == 0 && advertise._dps2Boosters.length == 0) {
                            await addTank(advertise, user);
                        }
                    }
                } 
            }// If user not select TANK
            else if (!advertise._tankUsers.includes(user)){
                // Which one is better select DPS/DPS2
                if (advertise._dpsUsers.includes(user) && advertise._dpsBoosters.length == 0) {
                    await addDps(advertise, user);
                }
                else if (advertise._dps2Users.includes(user) && advertise._dps2Boosters.length == 0) {
                    await addDps2(advertise, user);
                }
            }
        }


        // User is waiting in Queue, release him before assign booster
        if (advertise._healerUsers.length > 0) {
            advertise._healerUsers.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }
    }
}

async function removeDps2(advertise, user) {
    //user = advertise._user;
    var message = advertise._message;

    if (advertise._dps2Users.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._dps2Boosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            temp.push({ name: '<:dps2:732689305805520919>', value: `<@${user.id}>`, inline: true });

            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

            // Remove user from dpsBooster
            let tmpUser = advertise._dps2Boosters.shift();
            // Remove user from dpsUsers
            // Find in healer user shifted healer booster
            // Delete tmpUser from dpsUsers
            let idx = advertise._dps2Users.indexOf(tmpUser);
            if (idx > -1) {
                advertise._dps2Users.splice(idx, 1);
            }
            /*
            // Remove user from boosterList
            idx = advertise._boosterList.indexOf(tmpUser);
            if (idx > -1) {
                advertise._boosterList.splice(idx, 1);
            }*/

            // Add first user at dpsUser queue
            // TODO Send who is waiting dps2 queue
            if (advertise._dps2Users.length > 0) {
                await addDps2(advertise, advertise._dpsUsers[0]);
            }
                       
            if(advertise._tankUsers.includes(user)){
                if(advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)){
                    if (advertise._healerUsers.length == 0)
                        await addHealer(advertise, user);
                }// TODO DPS/DPS2 reaction doesnt work perfectly
                else if(advertise._dpsUsers.includes(user)){
                    if (advertise._dpsUsers.length == 0)
                        await addDps(advertise, user);
                }
                else{
                    if(advertise._tankUsers.length == 0)
                        await addTank(advertise, user);
                }
            }
            else if (!advertise._tankUsers.includes(user)) {
                if (advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)) {
                    if (advertise._healerUsers.length == 0)
                        await addHealer(advertise, user);
                }// TODO DPS/DPS2 reaction doesnt work perfectly
                else if (advertise._dpsUsers.includes(user)) {
                    if (advertise._dpsUsers.length == 0)
                        await addDps(advertise, user);
                }
            }
        }

        // User is waiting in Queue, release him before assign booster
        if (advertise._dps2Users.length > 0) {
            advertise._dps2Users.forEach(function (item, index, object) {
                if (item === user) {
                    object.splice(index, 1);
                }
            });
        }

    }
}

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.bot){
        
    }
    var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);
    if (!user.bot && currAdv) {

        // Find which advertise reacted
        //let advertiser = currAdv._advertiser;
        if (currAdv) {
            // Dps Queue
            if (reaction.emoji.id === '731617839290515516') {

                // if reacted user does not exist in dpsUsers, avoid clone
                if (!currAdv._dpsUsers.includes(user) && !currAdv._dps2Users.includes(user)) {
                    // if booster is already take the any role boost, put new user front of him
                    if (currAdv._dpsBoosters[0] == (currAdv._tankUsers[0] || currAdv._healerUsers[0] || currAdv._dps2Users[0])) {
                        await currAdv._dpsUsers.unshift(user);
                        await addDps(currAdv, currAdv._dpsUsers[0]);
                    }
                    else {
                        await currAdv._dpsUsers.push(user);
                        await addDps(currAdv, currAdv._dpsUsers[0]);
                    }  
                }
            }// Dps 2 Queue
            else if (reaction.emoji.id === '732689305805520919') {
                // if reacted user does not exist in healerUsers, avoid clone
                if (!currAdv._dps2Users.includes(user) && !currAdv._dpsUsers.includes(user)) {
                    if (currAdv._dps2Boosters[0] == (currAdv._dpsUsers[0] || currAdv._tankUsers[0] || currAdv._healerUsers[0])) {
                        await currAdv._dps2Users.unshift(user);
                        await addDps2(currAdv, currAdv._dps2Users[0]);
                    }
                    else {
                        await currAdv._dps2Users.push(user);
                        await addDps2(currAdv, currAdv._dps2Users[0]);
                    }
                }
            }// Tank Queue
            else if (reaction.emoji.id === '731617839596961832') {
                // if reacted user does not exist in tankUsers, avoid clone
                if (!currAdv._tankUsers.includes(user)) {
                    if (currAdv._tankBoosters[0] == (currAdv._dpsUsers[0] || currAdv._healerUsers[0] || currAdv._dps2Users[0])) {
                        await currAdv._tankUsers.unshift(user);
                        await addTank(currAdv, currAdv._tankUsers[0]);
                    }
                    else {
                        await currAdv._tankUsers.push(user);
                        await addTank(currAdv, currAdv._tankUsers[0]);
                    }
                }
            }// Healer Queue
            else if (reaction.emoji.id === '731617839370469446') {
                // if reacted user does not exist in healerUsers, avoid clone
                if (!currAdv._healerUsers.includes(user)) {
                    if (currAdv._healerBoosters[0] == (currAdv._dpsUsers[0] || currAdv._tankUsers[0] || currAdv._dps2Users[0] )) {
                        await currAdv._healerUsers.unshift(user);
                        await addHealer(currAdv, currAdv._healerUsers[0]);
                    } else {
                        await currAdv._healerUsers.push(user);
                        await addHealer(currAdv, currAdv._healerUsers[0]);
                    }
                }
            }// Only advertiser can react, when the boos complete!
            else if (reaction.emoji.name === '✅'){
                if(currAdv._advertiser == user){
                    console.log(`You're a Advertiser!`);

                }else{
                    console.log(`You're NOT a Advertiser!`);
                }
            }
        }
    }else{
        console.log(`Advertise not registered! Please contact`)
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    

    var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);
    
    // find which advertise reacted
    if (currAdv) {
        // DPS Boosters

        if (reaction.emoji.id === '731617839290515516') {
            if (reaction.message.id == currAdv._message.id) {
                await removeDps(currAdv, user);
            }
        }// DPS2 Boosters
        else if (reaction.emoji.id === '732689305805520919') {
            if (reaction.message.id == currAdv._message.id) {
                await removeDps2(currAdv, user);
            }
        } // Tank Boosters
        else if (reaction.emoji.id === '731617839596961832') {
            if (reaction.message.id == currAdv._message.id) {
                await removeTank(currAdv, user);
            }
        } // DPS2 Boosters
        else if (reaction.emoji.id === '731617839370469446') {
            if (reaction.message.id == currAdv._message.id) {
                await removeHealer(currAdv, user);
            }
        }
    }
});