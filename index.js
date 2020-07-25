// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const { prefix, config } = require('./config.json');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const boosterCut = 0.175; // Booster Rate
const advertiserCut = 0.25; // Advertiser Rate

// Webhook messages drops here (channel id)
const webhookFromChannelId = "731543421340221521";
// Routing to booster channel coming webhook
const webhookToChannelId = "731523810662154311";
// Command channel
const commandChannelId = "731232365388759113";

// The spreadsheet ID from the url
const doc = new GoogleSpreadsheet('1Gcxal2auntcl37JUir26PUpyeZCMJwkYzn3o24CEzsY');

client.login(process.env.DISCORD_TOKEN);

class Advertise {
    constructor(message, advertiser, isFull, isCompleted, isCanceled, 
             dpsUsers, dpsBoosters, 
             tankUsers, tankBoosters, 
             healerUsers, healerBoosters, 
             dps2Users, dps2Boosters) {
        this._message = message
        this._advertiser = advertiser;
        this._isFull = isFull;
        this._isCompleted = isCompleted;
        this._isCanceled = isCanceled;
        
        //this._isDpsKey = isDpsKey;
        this._dpsUsers = dpsUsers;
        this._dpsBoosters = dpsBoosters;

        //this._isDps2Key = isDps2Key;
        this._dps2Users = dps2Users;
        this._dps2Boosters = dps2Boosters;

        //this._isTankKey = isTankKey;
        this._tankUsers = tankUsers;
        this._tankBoosters = tankBoosters;

        //this._isHealerKey = isHealerKey;
        this._healerUsers = healerUsers;
        this._healerBoosters = healerBoosters;
    }
}

class AdvertiseLog{
    constructor(advertise) {
        this._boostId = advertise._message.id;
        this._boostPrice = advertise._message.embeds[0].fields[6].value;
        this._publishedDate = new Date().toLocaleString();
        this._startedDate = 0;
        this._completedDate = 0;
        this._isCompleted = advertise._isCompleted;
        this._isCanceled = advertise._isCanceled;
        this._boostedCustomer = advertise._message.embeds[0].fields[9].value;
        this._advertiserId = advertise._advertiser.id;
        this._advertiseCut = Math.round((parseInt(advertise._message.embeds[0].fields[6].value) * (advertiserCut)));
        this._dpsBoosterId = 0;
        this._dpsBoosterCut = 0;
        this._dps2BoosterId = 0;
        this._dps2BoosterCut = 0;
        this._healerBoosterId = 0;
        this._healerBoosterCut = 0;
        this._tankBoosterId = 0;
        this._tankBoosterCut = 0;
    }
}

var MessageList = new Array();
var isAdvertiserDps = Boolean(false);
var isAdvertiserTank = Boolean(false);
var isAdvertiserHealer = Boolean(false);
var isAdvertiserKey = Boolean(false);

async function newAdvertise(message, advertiser, isFull, isCompleted, isCanceled) {
    let dpsBoosters = Array();
    let dpsUsers = Array();
    let tankBoosters = Array();
    let tankUsers = Array();
    let healerBoosters = Array();
    let healerUsers = Array();
    let dps2Boosters = Array();
    let dps2Users = Array();

    let adv = new Advertise(message, advertiser, isFull, isCompleted, isCanceled, 
        dpsUsers, dpsBoosters, 
        tankUsers, tankBoosters, 
        healerUsers, healerBoosters, 
        dps2Users, dps2Boosters);

    MessageList.push(adv);    
    return adv;
}

async function modifyWebhook(embed) {
    // Modify hooked message from webhook channel
    var newEmbed = new Discord.MessageEmbed()
        .setColor('#f5da42')
        .setTitle(embed.title)
        //.setDescription('Some description here')
        .setThumbnail('https://i.ibb.co/1fZjCLz/anka-trans.png')
        //.addField('Inline field title', 'Some value here', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('BoostId: ', 'https://i.ibb.co/1fZjCLz/anka-trans.png');
    
        
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
            newEmbed.addField(`Booster Cut %${boosterCut}`, (Math.round(parseInt(item.value)*(boosterCut))), true);
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

async function insertBoostRow(advertise){

    await doc.useServiceAccountAuth(require('./client_secret.json'));
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    try {
        let advertiseLog = new AdvertiseLog(advertise);

        await sheet.addRow({
            BoostId: advertiseLog._boostId,
            BoostPrice: advertiseLog._boostPrice,
            PublishedDate: advertiseLog._publishedDate,
            isCompleted: advertiseLog._isCompleted,
            isCanceled: advertiseLog._isCanceled,
            BoostedCustomer: advertiseLog._boostedCustomer,
            AdvertiserId: advertiseLog._advertiserId}
        );

    } catch (error) {
        console.log(`Error while insertBoostRow ${error}`)
    }
}

// Binds coming from Json datas to AdvertiseLog(object)
async function modifyAdvertiseLog(advertise, row){
    row.isCompleted = advertise._isCompleted;
    row.isCanceled = advertise._isCanceled;
    row.AdvertiserId = advertise._advertiser.id;

    if (advertise._isCompleted) {
        let advertiserPrice = Math.round((parseInt(row.BoostPrice) * advertiserCut));
        let boosterPrice = Math.round((parseInt(row.BoostPrice) * boosterCut));

        row.CompletedDate = new Date().toLocaleString();
        row.AdvertiseCut = advertiserPrice;
        row.DpsBooster = advertise._dpsBoosters[0].id;
        row.DpsBoosterCut = boosterPrice;
        row.Dps2Booster = advertise._dps2Boosters[0].id;
        row.Dps2BoosterCut = boosterPrice;
        row.HealerBooster = advertise._healerBoosters[0].id;
        row.HealerBoosterCut = boosterPrice;
        row.TankBooster = advertise._tankBoosters[0].id;
        row.TankBoosterCut = boosterPrice;
    }

    return row;
}

// Modify 
async function updateBoostRow(advertise){
    console.log(`Spreadsheet update start at ${new Date().toLocaleString()}`);
    await doc.useServiceAccountAuth(require('./client_secret.json'));
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    var rows = await sheet.getRows();

    try {
        // Find specific row which is matches with advertiseId
        var advertiseId = advertise._message.id;
        // Search all of rows
        for (let row of rows) {
            // Which row.BoostId match with advertiseId(message id)
            if (advertiseId === row.BoostId) {
                row = await modifyAdvertiseLog(advertise, row);
                await row.save();
            }
        }
    } catch (error) {
        console.log(`Error while updateBoostRow ${error}`)
    }


    console.log(`Spreadsheet update end at ${new Date().toLocaleString()}`);
}

// When new member registered at Booster role insert him to sheet
async function insertBoosterRow(user) {
    await doc.useServiceAccountAuth(require('./client_secret.json'));
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[1];

    const rows = await sheet.getRows();

    try {
        let isExist = false;
        for (let row of rows) {
            if ((user.id === row.BoosterId)) {
                isExist = true;
            }

        }

        if (!isExist) {
            await sheet.addRow({
                BoosterId: user.id,
                BoosterTag: user.tag,
                Balance: 0,
                RegisteredAt: new Date().toLocaleString()
            });
            console.log(`Booster added to sheet ${user.tag}`);
        }
    } catch (error) {
        console.log(`Error while insertNewBooster ${error}`)
    }
}

// Get current user balance
async function getBoosterBalance(user) {
    console.log(`Spreadsheet booster balance start at ${new Date().toLocaleString()}`);
    await doc.useServiceAccountAuth(require('./client_secret.json'));
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[1];

    var rows = await sheet.getRows();
    try {
        // Find specific row which is matches with advertiseId
        var boosterId = user.id;
        var balance = 0;
        // Search all of rows
        for (let row of rows) {
            if (boosterId === row.BoosterId) {
                balance = row.Balance;
            }
        }
    } catch (error) {
        console.log(`Error while getBoosterBalance ${error}`)
    }
    console.log(`Spreadsheet booster balance end at ${new Date().toLocaleString()}`);

    return balance;
}

// Add money to user balance
async function depositBalance(user, amount){
    await doc.useServiceAccountAuth(require('./client_secret.json'));
    await doc.loadInfo();

    // Booster Balance
    const sheet = doc.sheetsByIndex[1];

    var rows = await sheet.getRows();

    // Find specific row which is matches with advertiseId
    var userId = user.id;
    // Search all of rows
    try {
        for (let row of rows) {
            if (userId === row.BoosterId) {
                currentAmount = parseInt(row.Balance);
                depositAmount = parseInt(amount);
                row.Balance = currentAmount + depositAmount;
                row.UpdatedAt = new Date().toLocaleString();
                await row.save();
                return (`${amount} deposit successful to <@${user.id}> balance!`);
            }
        }
    } catch (error) {
        console.log(`Error while addBoosterBalance ${user} - ${error}`)
    }
}

// Withdraw money to user balance
async function withdrawBalance(user, amount) {
    await doc.useServiceAccountAuth(require('./client_secret.json'));
    await doc.loadInfo();

    // Booster Balance
    const sheet = doc.sheetsByIndex[1];

    var rows = await sheet.getRows();

    // Find specific row which is matches with advertiseId
    var userId = user.id;
    // Search all of rows
    try {
        for (let row of rows) {
            if (userId === row.BoosterId) {
                currentAmount = parseInt(row.Balance);
                withdrawAmount = parseInt(amount);
                if (currentAmount >= withdrawAmount) {
                    row.Balance = currentAmount - withdrawAmount;
                    row.UpdatedAt = new Date().toLocaleString();
                    await row.save();
                    return (`${withdrawAmount} withdrawals successful from <@${user.id}> balance!`);
                }
                else{
                    return (`The amount ${withdrawAmount} cannot be higher than <@${user.id}> balance!`);
                }
            }
        }
    } catch (error) {
        console.log(`Error while withdrawBalance ${user} - ${error}`)
    }
}

client.on('ready', async () => {
    console.log(`Bot started at ${new Date().toLocaleString()}`);

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
                if (!(m.embeds[0] == null)){
                    // If advertise removed dont store
                    if (!(m.embeds[0].title == 'Boosting Canceled!')) {

                        for (const field of m.embeds[0].fields) {
                            if (field.name == 'Advertiser') {

                                let regexId = field.value.replace(/\D/g, "");
                                // Return user with by ID
                                let advertiser = await client.users.fetch(regexId);
                                var createdAdvertise = await newAdvertise(m, advertiser, false, false, false);
                                console.log(`Advertise id: ${m.id} not in cache, then cached!`);
                            } // Fetching DPS AREA
                            else if (field.name === '<:dps:734394556371697794>') {
                                const regexp = /\D+/g;
                                const regexp2 = /\d+/g;

                                let regexUserId = field.value.replace(regexp, "");
                                let regexResult = field.value.replace(regexp2, "");
                                if (regexResult === '<@><:keys:>'){
                                    createdAdvertise._isDpsKey = true
                                    //Take first 18 digit User Id
                                    regexUserId = regexUserId.substring(0,18);
                                }
                                
                                // Return user with by ID
                                let user = await client.users.fetch(regexUserId);
                                createdAdvertise._dpsBoosters.push(user);
                                createdAdvertise._dpsUsers.push(user);
                            } // Fetching DPS2 AREA
                            else if (field.name === '<:dps2:734394556744728628>') {
                                const regexp = /\D+/g;
                                const regexp2 = /\d+/g;

                                let regexUserId = field.value.replace(regexp, "");
                                let regexResult = field.value.replace(regexp2, "");
                                if (regexResult === '<@><:keys:>') {
                                    createdAdvertise._isDps2Key = true
                                    //Take first 18 digit User Id
                                    regexUserId = regexUserId.substring(0, 18);
                                }
                                // Return user with by ID
                                let user = await client.users.fetch(regexUserId);
                                createdAdvertise._dps2Boosters.push(user);
                                createdAdvertise._dps2Users.push(user);
                            } // Fetching TANK AREA
                            else if (field.name === '<:tank:734394557684383775>') {
                                const regexp = /\D+/g;
                                const regexp2 = /\d+/g;

                                let regexUserId = field.value.replace(regexp, "");
                                let regexResult = field.value.replace(regexp2, "");
                                if (regexResult === '<@><:keys:>') {
                                    createdAdvertise._isTankKey = true
                                    //Take first 18 digit User Id
                                    regexUserId = regexUserId.substring(0, 18);
                                }
                                // Return user with by ID
                                let user = await client.users.fetch(regexUserId);
                                createdAdvertise._tankBoosters.push(user);
                                createdAdvertise._tankUsers.push(user);
                            } // Fetching HEALER AREA
                            else if (field.name === '<:healer:734394557294182520>') {
                                const regexp = /\D+/g;
                                const regexp2 = /\d+/g;

                                let regexUserId = field.value.replace(regexp, "");
                                let regexResult = field.value.replace(regexp2, "");
                                if (regexResult === '<@><:keys:>') {
                                    createdAdvertise._isHealerKey = true
                                    //Take first 18 digit User Id
                                    regexUserId = regexUserId.substring(0, 18);
                                }
                                // Return user with by ID
                                let user = await client.users.fetch(regexUserId);
                                createdAdvertise._healerBoosters.push(user);
                                createdAdvertise._healerUsers.push(user);
                            }
                        }
                        // TODO old messages reactions must be deleted
                        //m.reactions.remove(message.author.id);
                    } else {
                        console.log(`Advertise id: ${m.id} status canceled or started, then skipped!`);
                    }
                } 
                
            }
        }
        else{
            console.log(`This channel doesn't have a any advertise`);
        }
    } catch (error) {
        console.log(`ERROR while bot starting fetching old messages: ${error}`);
    }
    
    console.log(`Bot loaded at ${new Date().toLocaleString()}`);
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
            await client.channels.cache.get(webhookToChannelId).send(newEmbed);         
        } catch (error) {
            console.log("WEBHOOK POST ERROR: " + error);
        }
    }
    // Modified webhooks, converting to the RichEmbed and filling inside
    if(message.channel.id === webhookToChannelId && message.author.bot){
        if(message.embeds[0].title != null){
            if (message.embeds[0].title == 'Need Dungeon Booster!') {
                // Add boostId for MessageId 
                tmpEmbed = message.embeds[0].setFooter('BoostId: ' + message.id, 'https://i.ibb.co/1fZjCLz/anka-trans.png');
                await message.edit(tmpEmbed);

                // Get advertiser from posted message with RegEx
                let advertiserId = message.embeds[0].fields[0].value.replace(/\D/g, "");
                // Return user with by ID
                let advertiser = await client.users.fetch(advertiserId);

                var adv = await newAdvertise(message, advertiser, false, false, false);

                // Search at MessageList bofere created advertise
                var advertise = await MessageList.find(x => x._message.id == message.id);

                // If advertiser wants to be a booster too check conditions
                if (isAdvertiserDps) {
                    // Have a key for DPS
                    if (isAdvertiserKey) {
                        advertise._isDpsKey = true;
                        advertise._dpsUsers.unshift(advertiser);
                        await addDps(advertise, advertiser);
                    } else {
                        advertise._dpsUsers.push(advertiser);
                        await addDps(advertise, advertiser);
                    }
                    isAdvertiserKey = false;
                    isAdvertiserDps = false;
                }
                else if (isAdvertiserHealer) {
                    // Have a key for HEALER
                    if (isAdvertiserKey) {
                        advertise._isHealerKey = true;
                        advertise._healerUsers.unshift(advertiser);
                        await addHealer(advertise, advertiser);
                    } else {
                        advertise._healerUsers.push(advertiser);
                        await addHealer(advertise, advertiser);
                    }
                    isAdvertiserKey = false;
                    isAdvertiserHealer = false;
                }
                else if (isAdvertiserTank) {
                    // Have a key for TANK
                    if (isAdvertiserKey) {
                        advertise._isTankKey = true;
                        advertise._tankUsers.unshift(advertiser);
                        addTank(advertise, advertiser);
                    } else {
                        advertise._tankUsers.push(advertiser);
                        addTank(advertise, advertiser);
                    }
                    isAdvertiserKey = false;
                    isAdvertiserTank = false;
                }

                await insertBoostRow(advertise);

                // Add reacts to the message
                await message.react('734394556371697794') // DPS
                    .then(() => message.react('734394557684383775')) // TANK
                    .then(() => message.react('734394557294182520')) // HEALER
                    .then(() => message.react('734394556744728628')) // DPS-2
                    .then(() => message.react('734119765173600331')) // KEY
                    .then(() => message.react('734368776908177468')) // EMPTY
                    .then(() => message.react('734367159152541727')) // DONE
                    .then(() => message.react('734367159148347392')) // CANCEL
                    .catch(`Problems while adding reactions!`);

                // Notice all members after created advertise
                let newMsg = new Discord.MessageEmbed();
                newMsg.setDescription(`**New boost created!\nBoost Id` + "```" + `${message.id}` + "```" +`\n<@&734454074467942903> <@&734454021343019159> <@&734453923665936394>**`);
            
                await client.channels.cache.get(webhookToChannelId).send(newMsg); 

            }
        }
    } 
    // Modified webhooks, converting to the RichEmbed and filling inside
    if (message.channel.id === commandChannelId && !message.author.bot) { 
        let boosterRoleId = "735230459650506772"; 

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const regexp = /\D+/g;

        if (command === 'balance') {
            let balance = await getBoosterBalance(message.author);
            message.reply(`your balance: **${balance}** <:gold:735477957388402690>`);
        }
        else if (command === 'withdraw') {
            if ((!args[0] || !args[1]) == '') {
                // Return user with by ID
                let user = await client.users.fetch(args[0].replace(regexp, ''));
                let isNum = /^\d+$/.test(args[1]);

                if (user && isNum) {
                    let transactionMsg = await withdrawBalance(user, args[1]);
                    if (transactionMsg) {
                        message.reply(`${transactionMsg}`);
                    }
                    else {
                        message.reply(`<@${user.id}> don't have a role!`);
                    }
                } else {
                    message.reply(`amount must be digits, not include comma, dot etc.`);
                }
            } else {
                message.reply(`ex: ${prefix}deposit @user#1234 30100`);
            }
        }
        else if (command === 'deposit') {
            if((!args[0] || !args[1]) == ''){
                // Return user with by ID
                let user = await client.users.fetch(args[0].replace(regexp, ''));
                let isNum = /^\d+$/.test(args[1]);

                if(user && isNum){
                    let transactionMsg = await depositBalance(user, args[1]);
                    if(transactionMsg){
                        message.reply(`${transactionMsg}`);
                    }
                    else{
                        message.reply(`<@${user.id}> don't have a role!`);
                    }
                }else{
                    message.reply(`amount must be digits, not include comma, dot etc.`);
                }
            }else{
                message.reply(`ex: ${prefix}deposit @user#1234 30100`);
            }
        }
    } 
});


client.on('guildMemberUpdate', async member => {
    // Specific role which user get this role
    let boosterRoleId = "735230459650506772"; 
    //var userRoles = member.roles.cache.find(r => r.id === roleId);

    // if member in specific role take it otherwise skip
    let res = member.guild.roles.cache.get(boosterRoleId).members.get(member.id);

    if(res){
        //which member takes a booster role then add him to sheet
        await insertBoosterRow(member.user);        
    }
});

async function addDps(advertise, user) {
    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user)) {
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if(advertise._isDpsKey){
                tmpEmbed.fields.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            }else{
                tmpEmbed.fields.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}>`, inline: true });
            }
            
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        if (advertise._dpsBoosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dpsBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if (advertise_isDpsKey) {
                tmpEmbed.fields.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                tmpEmbed.fields.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}>`, inline: true });
            }
            
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addTank(advertise, user) {
    if (!advertise._dpsUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dps2Users.includes(user)) {
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if(advertise._isTankKey){
                tmpEmbed.fields.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            }else{
                tmpEmbed.fields.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}>`, inline: true });
            }
             // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        if (advertise._tankBoosters.length == 0) {
            // Get first user in tankBoosters
            advertise._tankBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if (advertise._isTankKey) {
                tmpEmbed.fields.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                tmpEmbed.fields.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}>`, inline: true });
            }
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addHealer(advertise, user) {
    if (!advertise._dpsUsers.includes(user) && !advertise._tankUsers.includes(user) && !advertise._dps2Users.includes(user)) {
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if(advertise._isHealerKey){
                tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            }else{
                tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });
            }
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._tankUsers.includes(user) && !advertise._dpsBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if (advertise._isHealerKey) {
                tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });
            }
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._dpsUsers.includes(user) && !advertise._tankBoosters.includes(user) && !advertise._healerBoosters.includes(user)) {
        if (advertise._healerBoosters.length == 0) {
            // Get first user in healerBoosters
            advertise._healerBoosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if (advertise._isHealerKey) {
                tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                tmpEmbed.fields.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });
            }
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function addDps2(advertise, user) {
    if (!advertise._tankUsers.includes(user) && !advertise._healerUsers.includes(user) && !advertise._dpsUsers.includes(user)) {
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if(advertise._isDps2Key){
                tmpEmbed.fields.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            }else{
                tmpEmbed.fields.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}>`, inline: true });
            }
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
    else if (!advertise._healerUsers.includes(user) && !advertise._dps2Boosters.includes(user) && !advertise._tankBoosters.includes(user)) {
        if (advertise._dps2Boosters.length == 0) {
            // Get first user in dpsUsers
            advertise._dps2Boosters.push(user);

            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Modified embed message
            if (advertise._isDps2Key) {
                tmpEmbed.fields.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                tmpEmbed.fields.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}>`, inline: true });
            }
            // Send modified embed message
            await advertise._message.edit(tmpEmbed);
        }
    }
}

async function removeDps(advertise, user) {
    if (advertise._dpsUsers.includes(user)) {
        if (advertise._dpsBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;

            if(advertise._isDpsKey){
                temp.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            }else{
                temp.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}>`, inline: true });
            }
            
            for (let i = 0; i < tmpEmbed.fields.length; i++) {
                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                    tmpEmbed.fields.splice(i, 1);
                    i--;
                }
            }

            // New modified message
            await advertise._message.edit(tmpEmbed);

            // Remove user from dpsBooster
            var tmpUser = advertise._dpsBoosters.shift();
            // Remove user from dpsUsers
            // Find in healer user shifted healer booster
            // Delete tmpUser from dpsUsers
            let idx = advertise._dpsUsers.indexOf(tmpUser);
            if (idx > -1) {
                advertise._dpsUsers.splice(idx, 1);
            }

            // Who comes after him, avoid to add him with key (like reset)
            advertise._isDpsKey = false;

            // Add first user at dpsUser queue
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
    }
}

async function removeTank(advertise, user) {
    if (advertise._tankUsers.includes(user)) {
        if (advertise._tankBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            if (advertise._isTankKey) {
                temp.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                temp.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}>`, inline: true });
            }

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

            // Who comes after him, avoid to add him with key (like reset)
            advertise._isTankKey = false;

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
    }
}

async function removeHealer(advertise, user) {
    if (advertise._healerUsers.includes(user)) {
        //let tmpUser = user;
        //let newUser = dpsUsers[0];
        if (advertise._healerBoosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;
            
            if (advertise._isHealerKey) {
                temp.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                temp.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });
            }

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

            // Who comes after him, avoid to add him with key (like reset)
            advertise._isHealerKey = false;

            // Add first user at healerUser waiting at queue
            if (advertise._healerUsers.length > 0) {
                await addHealer(advertise, advertise._healerUsers[0]);
            }

            // If user select TANK
            if(advertise._tankUsers.includes(user)){
                // If user select TANK AND DPS/DPS2 prefer DPS/DPS2
                if(advertise._dpsUsers.includes(user) || advertise._dps2Users.includes(user)){
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
                        } else{
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
    }
}

async function removeDps2(advertise, user) {
    if (advertise._dps2Users.includes(user)) {
        if (advertise._dps2Boosters.length == 1) {
            let tmpMsg = advertise._message.embeds[0];
            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

            // Which message will be deleting
            let temp = new Discord.MessageEmbed().fields;

            if (advertise._isDps2Key) {
                temp.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
            } else {
                temp.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}>`, inline: true });
            }

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

            // Who comes after him, avoid to add him with key (like reset)
            advertise._isDps2Key = false;

            // Add first user at dpsUser queue
            if (advertise._dps2Users.length > 0) {
                await addDps2(advertise, advertise._dpsUsers[0]);
            }
                       
            if(advertise._tankUsers.includes(user)){
                if(advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)){
                    if (advertise._healerBoosters.length == 0)
                        await addHealer(advertise, user);
                }
                else if(advertise._dpsUsers.includes(user)){
                    if (advertise._dpsBoosters.length == 0)
                        await addDps(advertise, user);
                }
                else{
                    if(advertise._tankBoosters.length == 0)
                        await addTank(advertise, user);
                }
            }
            else if (!advertise._tankUsers.includes(user)) {
                if (advertise._healerUsers.includes(user) && advertise._dpsUsers.includes(user)) {
                    if (advertise._healerBoosters.length == 0)
                        await addHealer(advertise, user);
                }// TODO DPS/DPS2 reaction doesnt work perfectly
                else if (advertise._dpsUsers.includes(user)) {
                    if (advertise._dpsBoosters.length == 0)
                        await addDps(advertise, user);
                } else if (advertise._healerUsers.includes(user)){
                    if (advertise._healerBoosters.length == 0)
                        await addHealer(advertise, user);
                }
            }
        }
    }
}

async function dpsReplace(advertise, user){
    if (advertise._dpsUsers.includes(user) && !advertise._isDpsKey){
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from dpsBooster
        let tempUser = advertise._dpsBoosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:dps:734394556371697794>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tempUser from dpsUsers
        let idx = advertise._dpsUsers.indexOf(tempUser);
        if (idx > -1) {
            advertise._dpsUsers.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._dpsUsers.unshift(tempUser);
        
        idx = advertise._dpsUsers.indexOf(user);
        if (idx > -1) {
            advertise._dpsUsers.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isDpsKey = true;
        advertise._dpsUsers.unshift(user);

        await addDps(advertise, advertise._dpsUsers[0]);
    } // If anyone have a boosting already with key
    else if (advertise._dpsUsers.includes(user) && advertise._isDpsKey){
        // Then add user 2nd place
        if (advertise._dpsUsers.length == 0){
            advertise._dpsUsers.push(user);
        }
        console.log(`UserId: ${advertise.dpsBoosters[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

async function dps2Replace(advertise, user) {
    if (advertise._dps2Users.includes(user) && !advertise._isDps2Key) {
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from dps2Booster
        let tempUser = advertise._dps2Boosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:dps2:734394556744728628>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tempUser from dps2Users
        let idx = advertise._dps2Users.indexOf(tempUser);
        if (idx > -1) {
            advertise._dps2Users.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._dps2Users.unshift(tempUser);

        idx = advertise._dps2Users.indexOf(user);
        if (idx > -1) {
            advertise._dps2Users.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isDps2Key = true;
        advertise._dps2Users.unshift(user);

        await addDps2(advertise, advertise._dps2Users[0]);
    } // If anyone have a boosting already with key
    else if (advertise._dps2Users.includes(user) && advertise._isDps2Key) {
        // Then add user 2nd place
        if (advertise._dps2Users.length == 0) {
            advertise._dps2Users.push(user);
        }
        console.log(`UserId: ${advertise.dps2Boosters[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

async function tankReplace(advertise, user) {
    if (advertise._tankUsers.includes(user) && !advertise._isTankKey) {
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from tankBoosters
        let tempUser = advertise._tankBoosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:tank:734394557684383775>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tempUser from tankUsers
        let idx = advertise._tankUsers.indexOf(tempUser);
        if (idx > -1) {
            advertise._tankUsers.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._tankUsers.unshift(tempUser);

        idx = advertise._tankUsers.indexOf(user);
        if (idx > -1) {
            advertise._tankUsers.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isTankKey = true;
        advertise._tankUsers.unshift(user);

        await addTank(advertise, advertise._tankUsers[0]);
    } // If anyone have a boosting already with key
    else if (advertise._tankUsers.includes(user) && advertise._isTankKey) {
        // Then add user 2nd place
        if (advertise._tankUsers.length == 0) {
            advertise._tankUsers.push(user);
        }
        console.log(`UserId: ${advertise._tankBoosters[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

async function healerReplace(advertise, user) {
    if (advertise._healerUsers.includes(user) && !advertise._isHealerKey) {
        let tmpMsg = advertise._message.embeds[0];
        let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

        // Remove user from healerBoosters
        let tempUser = advertise._healerBoosters.shift();

        // Which message will be deleting
        let temp = new Discord.MessageEmbed().fields;
        temp.push({ name: '<:healer:734394557294182520>', value: `<@${tempUser.id}>`, inline: true });

        // Search message content and delete it
        for (let i = 0; i < tmpEmbed.fields.length; i++) {
            if ((tmpEmbed.fields[i].value == temp[0].value) && (tmpEmbed.fields[i].name == temp[0].name)) {
                tmpEmbed.fields.splice(i, 1);
                i--;
            }
        }
        // New modified message
        await advertise._message.edit(tmpEmbed);

        // Delete tempUser from healerUsers
        let idx = advertise._healerUsers.indexOf(tempUser);
        if (idx > -1) {
            advertise._healerUsers.splice(idx, 1);
        }
        // Insert tempUser to 2nd place
        advertise._healerUsers.unshift(tempUser);

        idx = advertise._healerUsers.indexOf(user);
        if (idx > -1) {
            advertise._healerUsers.splice(idx, 1);
        }
        // Insert user to 1st place
        advertise._isTankKey = true;
        advertise._healerUsers.unshift(user);

        await addHealer(advertise, advertise._healerUsers[0]);
    } // If anyone have a boosting already with key
    else if (advertise._healerUsers.includes(user) && advertise._isHealerKey) {
        // Then add user 2nd place
        if (advertise._healerUsers.length == 0) {
            advertise._healerUsers.push(user);
        }
        console.log(`UserId: ${advertise._healerUsers[0].id} is already have a key! ${user.id} is coming after him.`)
    }
}

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.bot){
    }

    var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);

    if ((!user.bot && currAdv) && (reaction.message.channel.id == webhookToChannelId)) {
        // Find which advertise reacted
        if (currAdv) {
            // If is advertise isnt full then catch reactions
            // Boosters can react those
            if(!currAdv._isFull && !currAdv._isCanceled && !currAdv.isComplete){
                // Dps Queue
                if (reaction.emoji.id === '734394556371697794') {
                    // if reacted user does not exist in dpsUsers, avoid clone
                    if (!currAdv._dpsUsers.includes(user) && !currAdv._dps2Users.includes(user)) {
                        // if booster is already take the any role boost, put new user front of him
                        if ((currAdv._dpsBoosters[0] == currAdv._tankBoosters[0]) ||
                            (currAdv._dpsBoosters[0] == currAdv._healerBoosters[0]) ||
                            (currAdv._dpsBoosters[0] == currAdv._dps2Boosters[0])) {
                            await currAdv._dpsUsers.unshift(user);
                        }
                        else {
                            await currAdv._dpsUsers.push(user);
                        }
                        if (currAdv._dpsBoosters.length == 0) {
                            await addDps(currAdv, currAdv._dpsUsers[0]);
                        }
                    }
                }// Dps 2 Queue
                else if (reaction.emoji.id === '734394556744728628') {
                    // if reacted user does not exist in healerUsers, avoid clone
                    if (!currAdv._dps2Users.includes(user) && !currAdv._dpsUsers.includes(user)) {
                        if ((currAdv._dps2Boosters[0] == currAdv._dpsBoosters[0]) ||
                            (currAdv._dps2Boosters[0] == currAdv._tankBoosters[0]) ||
                            (currAdv._dps2Boosters[0] == currAdv._healerBoosters[0])) {
                            await currAdv._dps2Users.unshift(user);
                        }
                        else {
                            await currAdv._dps2Users.push(user);
                        }
                        if (currAdv._dps2Boosters.length == 0) {
                            await addDps2(currAdv, currAdv._dps2Users[0]);
                        }
                    }
                }// Tank Queue
                else if (reaction.emoji.id === '734394557684383775') {
                    // if reacted user does not exist in tankUsers, avoid clone
                    if (!currAdv._tankUsers.includes(user)) {
                        if ((currAdv._tankBoosters[0] == currAdv._dpsBoosters[0]) ||
                            (currAdv._tankBoosters[0] == currAdv._healerBoosters[0]) ||
                            (currAdv._tankBoosters[0] == currAdv._dps2Boosters[0])) {
                            await currAdv._tankUsers.unshift(user);
                        }
                        else {
                            await currAdv._tankUsers.push(user);
                        }
                        if (currAdv._tankBoosters.length == 0 && !currAdv._dpsBoosters.includes(user) && !currAdv._dps2Boosters.includes(user) && !currAdv._healerBoosters.includes(user)) {
                            await addTank(currAdv, currAdv._tankUsers[0]);
                        }
                    }
                }// Healer Queue
                else if (reaction.emoji.id === '734394557294182520') {
                    // if reacted user does not exist in healerUsers, avoid clone
                    if (!currAdv._healerUsers.includes(user)) {
                        // TODO If user already registered at any booster go front of him
                        if ((currAdv._healerBoosters[0] == currAdv._dpsBoosters[0]) ||
                            (currAdv._healerBoosters[0] == currAdv._tankBoosters[0]) ||
                            (currAdv._healerBoosters[0] == currAdv._dps2Boosters[0])) {
                            await currAdv._healerUsers.unshift(user);
                        }
                        else {
                            await currAdv._healerUsers.push(user);
                        }
                        if (currAdv._healerBoosters.length == 0 && !currAdv._dpsBoosters.includes(user) && !currAdv._dps2Boosters.includes(user) && !currAdv._tankBoosters.includes(user)) {
                            await addHealer(currAdv, currAdv._healerUsers[0]);
                        }
                    }
                }// Key Button
                else if (reaction.emoji.id === '734119765173600331') {
                    // REPLACE HEALER
                    if (currAdv._healerUsers.includes(user) || currAdv._healerBoosters.includes(user)) {
                        // User is already in HEALER, change the Key status
                        if (currAdv._healerUsers.includes(user) && currAdv._healerBoosters.includes(user)) {
                            currAdv._isHealerKey = true;

                            let tmpMsg = currAdv._message.embeds[0];
                            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                            // Modified embed message
                            let temp = new Discord.MessageEmbed().fields;
                            temp.push({ name: '<:healer:734394557294182520>', value: `<@${user.id}>`, inline: true });

                            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                                    tmpEmbed.fields.splice(i, 1, { name: '<:healer:734394557294182520>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
                                    i--;
                                }
                            }

                            // Send modified embed message
                            await currAdv._message.edit(tmpEmbed);
                        }
                        // User is waiting at queue add him instantly to the HEALER
                        else if (currAdv._healerUsers.includes(user) && !currAdv._healerBoosters.includes(user) && currAdv._isHealerKey) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await healerReplace(currAdv, user);
                        }
                    }
                    else if (currAdv._dpsUsers.includes(user) || currAdv._dpsBoosters.includes(user)) {
                        // User is already in DPS, change the Key status
                        if (currAdv._dpsUsers.includes(user) && currAdv._dpsBoosters.includes(user)) {
                            currAdv._isDpsKey = true;

                            let tmpMsg = currAdv._message.embeds[0];
                            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                            // Modified embed message
                            let temp = new Discord.MessageEmbed().fields;
                            temp.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}>`, inline: true });
                            //tmpEmbed.fields.push({ name: '<:dps:734394556371697794>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });

                            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                                    tmpEmbed.fields.splice(i, 1, { name: '<:dps:734394556371697794>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
                                    i--;
                                }
                            }

                            // Send modified embed message
                            await currAdv._message.edit(tmpEmbed);
                        }
                        // User is waiting at queue add him instantly to the DPS
                        else if (currAdv._dpsUsers.includes(user) && !currAdv._dpsBoosters.includes(user) && currAdv._isDpsKey) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await dpsReplace(currAdv, user);
                        }
                    }
                    else if (currAdv._dps2Users.includes(user) || currAdv._dps2Boosters.includes(user)) {
                        // User is already in DPS2, change the Key status
                        if (currAdv._dps2Users.includes(user) && currAdv._dps2Boosters.includes(user)) {
                            currAdv._isDps2Key = true;

                            let tmpMsg = currAdv._message.embeds[0];
                            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                            // Modified embed message
                            let temp = new Discord.MessageEmbed().fields;
                            temp.push({ name: '<:dps2:734394556744728628>', value: `<@${user.id}>`, inline: true });
                            
                            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                                    tmpEmbed.fields.splice(i, 1, { name: '<:dps2:734394556744728628>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
                                    i--;
                                }
                            }

                            // Send modified embed message
                            await currAdv._message.edit(tmpEmbed);
                        }
                        // User is waiting at queue add him instantly to the DPS2
                        else if (currAdv._dps2Users.includes(user) && !currAdv._dps2Boosters.includes(user) && currAdv._isDps2Key) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await dps2Replace(currAdv, user);
                        }
                    }
                    else if (currAdv._tankUsers.includes(user) || currAdv._tankBoosters.includes(user)) {
                        // User is already in TANK, change the Key status
                        if (currAdv._tankUsers.includes(user) && currAdv._tankBoosters.includes(user)) {
                            currAdv._isTankKey = true;

                            let tmpMsg = currAdv._message.embeds[0];
                            let tmpEmbed = new Discord.MessageEmbed(tmpMsg);

                            // Modified embed message
                            let temp = new Discord.MessageEmbed().fields;
                            temp.push({ name: '<:tank:734394557684383775>', value: `<@${user.id}>`, inline: true });

                            for (let i = 10; i < tmpEmbed.fields.length; i++) {
                                if (tmpEmbed.fields[i].value == temp[0].value && tmpEmbed.fields[i].name == temp[0].name) {
                                    tmpEmbed.fields.splice(i, 1, { name: '<:tank:734394557684383775>', value: `<@${user.id}><:keys:734119765173600331>`, inline: true });
                                    i--;
                                }
                            }

                            // Send modified embed message
                            await currAdv._message.edit(tmpEmbed);
                        }
                        // User is waiting at queue add him instantly to the TANK
                        else if (currAdv._tankUsers.includes(user) && !currAdv._tankBoosters.includes(user) && currAdv._isTankKey) {
                            // Remove user if doesnt have key, put 2nd place dps queue
                            await tankReplace(currAdv, user);
                        }
                    } else {
                        console.log(`${user.tag} have to select ant role before click KEY!`);
                    }
                }
            }
            else {
                console.log(`Advertise cannot reactable! It can be Full, Canceled or Completed!`);
            }
            //if (currAdv._advertiser == user) {
            if (currAdv._advertiser == user) {
                let boosterSize = currAdv._dpsBoosters.length;
                boosterSize += currAdv._dps2Boosters.length;
                boosterSize += currAdv._tankBoosters.length;
                boosterSize += currAdv._healerBoosters.length;

                // Advertise should be 4 boosters
                // When DONE button reacted, 
                // Remove all role emojis and change adv. FULL=true
                if (reaction.emoji.id === '734367159152541727' && !currAdv._isFull && (boosterSize == 4)) {
                    currAdv._isFull = true;

                    // edit message content
                    let tempMsg = currAdv._message.embeds[0];

                    tempMsg.setColor('#00e600');
                    tempMsg.setTitle('Boosting Started!');
                    tempMsg.setThumbnail('https://i.ibb.co/6PwpzFd/big-done.png');
                    tempMsg.setDescription(`**The boosting has been started by <@${user.id}> at ${new Date().toLocaleString()}!**`);

                    await currAdv._message.edit(tempMsg);

                    await updateBoostRow(currAdv);

                    let reactions = await currAdv._message.reactions;
                    let rec = await reactions.cache.map(reac => reac);

                    await rec.forEach(r => {
                        // Don't delete Done, RunFinish and Cancel Emojis
                        if (!(r.emoji.id == '734367159152541727') && !(r.emoji.id == '734367159148347392') && !(r.emoji.id == '734372934902218802')) {
                            r.remove();
                        }
                    });
                    currAdv._message.react('734372934902218802');
                    let newMsg = new Discord.MessageEmbed();
                    let advert = "<@" + currAdv._advertiser.id + ">";
                    //newMsg.setDescription("<@" + currAdv._advertiser.id + ">");
                    newMsg.setDescription(`<@${currAdv._advertiser.id}> owner of boosting started, Good luck!\n<:dps:734394556371697794><@${currAdv._dpsBoosters[0].id}>, <:dps2:734394556744728628><@${currAdv._dps2Boosters[0].id}>, <:healer:734394557294182520><@${currAdv._healerBoosters[0].id}>, <:tank:734394557684383775><@${currAdv._tankBoosters[0].id}>` + "```\\w " + currAdv._message.embeds[0].field[9].value + " inv```");
                    //newMsg.setDescription("<@" + currAdv._advertiser.id + `> owner of boosting started, Good luck!\n<:dps:734394556371697794><@${currAdv._dpsBoosters[0].id}>, <:dps2:734394556744728628><@${currAdv._dps2Boosters[0].id}>, <:healer:734394557294182520><@${currAdv._healerBoosters[0].id}>, <:tank:734394557684383775><@${currAdv._tankBoosters[0].id}>` + "```\\w " + currAdv._message.embeds[0].field[9].value + " inv```");

                    await client.channels.cache.get(webhookToChannelId).send(newMsg);
                }
                // When CANCELED button reacted, Change advertise content then
                // Remove all another emojis and change adv. status CANCELED=true
                else if (reaction.emoji.id === '734367159148347392' && !currAdv._isCanceled) {
                    currAdv._isCanceled = true;

                    await updateBoostRow(currAdv);

                    // edit message content
                    let tempMsg = currAdv._message.embeds[0];

                    tempMsg.fields = [];
                    tempMsg.setColor('#ff0000');
                    tempMsg.setTitle('Boosting Canceled!');
                    tempMsg.setThumbnail('https://i.ibb.co/gyXFgmC/big-cancel.png');
                    tempMsg.setDescription(`The boosting has been canceled by <@${user.id}>`);
                    
                    await currAdv._message.edit(tempMsg);

                    let reactions = await currAdv._message.reactions;
                    let rec = await reactions.cache.map(reac => reac);
                    await rec.forEach(r => {
                        // Don't delete Cancel Emoji
                        if (!(r.emoji.id == '734367159148347392')) {
                            r.remove();
                        }
                    });
                }
                // When FINISHED button reacted, 
                // Remove all another emojis and change adv. status COMPLETED=true
                else if (reaction.emoji.id === '734372934902218802' && !currAdv._isCompleted) {
                    currAdv._isCompleted = true;

                    await updateBoostRow(currAdv);
                    
                    const total = currAdv._message.embeds[0].fields[6].value;
                    const advertiserPrice = Math.round((parseInt(total) * advertiserCut));
                    const boosterPrice = Math.round((parseInt(total) * boosterCut));

                    await depositBalance(currAdv._advertiser, advertiserPrice);

                    await depositBalance(currAdv._dpsBoosters[0], boosterPrice);
                    await depositBalance(currAdv._dps2Boosters[0], boosterPrice);
                    await depositBalance(currAdv._healerBoosters[0], boosterPrice);
                    await depositBalance(currAdv._tankBoosters[0], boosterPrice);

                    // edit message content
                    let tempMsg = currAdv._message.embeds[0];


                    //tempMsg.fields = [];
                    tempMsg.setColor('#03fcad');
                    tempMsg.setTitle('Boosting Completed!');
                    tempMsg.setThumbnail('https://i.ibb.co/d6q1b40/runfinish.png');
                    tempMsg.setDescription(`The boosting has been completed, approved by <@${user.id}> at ${new Date().toLocaleString()}`);

                    await currAdv._message.edit(tempMsg);

                    // Balances added to the booster users
                    let reactions = await currAdv._message.reactions;
                    let rec = await reactions.cache.map(reac => reac);

                    await rec.forEach(r => {
                        if (!(r.emoji.id == '734372934902218802')) {
                            r.remove();
                        }
                    });

                    console.log(`${currAdv._message.id} is completed, balances will be added soon. You can check your balance`);
                }
                // Only advertiser can react those 
                else {
                    console.log(`You're NOT a Advertiser! ${user.tag}`);
                } 
            }
            
        } else {
            reaction.message.reply(`Advertise not registered! Please contact` + "```" + `${reaction.message.id}` + "```");
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    
    var currAdv = await MessageList.find(x => x._message.id == reaction.message.id);
    
    // Find which advertise reacted
    if (currAdv) {
        // DPS Boosters
        if (reaction.emoji.id === '734394556371697794') {
            if (reaction.message.id == currAdv._message.id) {
                if (currAdv._dpsBoosters.includes(user)) {
                    await removeDps(currAdv, user);
                } else {
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._dpsUsers.length > 0) {
                        currAdv._dpsUsers.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        }// DPS2 Boosters
        else if (reaction.emoji.id === '734394556744728628') {
            if (reaction.message.id == currAdv._message.id) {
                if (currAdv._dps2Boosters.includes(user)) {
                    await removeDps2(currAdv, user);
                } else {
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._dps2Users.length > 0) {
                        currAdv._dps2Users.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        } // Tank Boosters
        else if (reaction.emoji.id === '734394557684383775') {
            if (reaction.message.id == currAdv._message.id) {
                if (currAdv._tankBoosters.includes(user)) {
                    await removeTank(currAdv, user);
                } else {
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._tankUsers.length > 0) {
                        currAdv._tankUsers.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        } // Healer Boosters
        else if (reaction.emoji.id === '734394557294182520') {
            if (reaction.message.id == currAdv._message.id) {
                if(currAdv._healerBoosters.includes(user)){
                    await removeHealer(currAdv, user);
                }else{
                    // User is waiting in Queue, release him before assign booster
                    if (currAdv._healerUsers.length > 0) {
                        currAdv._healerUsers.forEach(function (item, index, object) {
                            if (item === user) {
                                object.splice(index, 1);
                            }
                        });
                    }
                }
            }
        } // Key Emote 
        else if (reaction.emoji.id === '734119765173600331') {
            // Key remove event already did from replace
        }
    }
});