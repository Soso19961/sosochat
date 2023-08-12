import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
bot.launch()

bot.on(message('voice'), async ctx => {
    try {
        await ctx.reply(code('АлешкинGPT думает, ожидайте...'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        console.log(link.href)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path)
        await ctx.reply(`Ваш запрос: ${text}`)

        const messages = [{ role: openai.roles.USER, content: text }]
        const response = await openai.chat(messages)

        await ctx.reply(response.content)
    } catch (e) {
        console.log('Error while voice message', e.message)
    } 
})

bot.command('start', async (ctx) => {
    await ctx.reply("Добро пожаловать! Для вашего удобства, мой бот принимает команды в голосовом формате. Текстовые запросы в настоящий момент не обрабатываются. Начните голосовое общение, нажав на иконку микрофона")
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
