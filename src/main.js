import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

console.log(config.get('TEST_ENV'))

const INITIAL_SESSION = {
    messages: [],
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
bot.launch()

bot.use(session())

bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду вашего голосового или текстового сообщения')
})

bot.on(message('voice'), async ctx => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply("<b><i>АлешкинGPT думает, ожидайте...</i></b>", { parse_mode: "HTML" });


        console.log("Getting file link...");
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        console.log("File link obtained:", link.href);
    
        console.log("Creating ogg...");
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        console.log("Ogg created:", oggPath);
    
        console.log("Converting ogg to mp3...");
        const mp3Path = await ogg.toMp3(oggPath, userId);
        console.log("Ogg converted to mp3:", mp3Path);

        console.log("Transcribing...");
        const text = await openai.transcription(mp3Path);
        await ctx.reply("<i>" + text + "</i>", { parse_mode: "HTML" });


        console.log("Chatting with OpenAI...");
        ctx.session.messages.push({ role: openai.roles.USER, content: text });
        const response = await openai.chat(ctx.session.messages);
        //console.log("OpenAI chat done:", { content: response.content });


        ctx.session.messages.push({
             role: openai.roles.ASSISTANT,
              content: response.content,
        });

        await ctx.reply(response.content);
    } catch (e) {
        console.log('Error while voice message:', e.message, '\nFull Error:', e);
    } 
})

bot.on(message('text'), async ctx => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('АлешкинGPT думает, ожидайте...'))

        ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text });
        
        const response = await openai.chat(ctx.session.messages);

        ctx.session.messages.push({
             role: openai.roles.ASSISTANT,
              content: response.content,
        });

        await ctx.reply(response.content);
    } catch (e) {
        console.log('Error while text message:', e.message, '\nFull Error:', e);
    } 
})

bot.command('start', async (ctx) => {
    await ctx.reply("<b>Добро пожаловать! Я готов ответить на ваши голосовые и текстовые вопросы. Просто начните диалог, отправив сообщение или нажав на иконку микрофона.</b>", { parse_mode: "HTML" });
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
