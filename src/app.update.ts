import {
	Ctx,
	Hears,
	InjectBot,
	Message,
	On,
	Start,
	Update
} from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { actionButtons } from './app.buttons'
import { AppService } from './app.service'
import { showList } from './app.utils'
import { Context } from './context.interface'

@Update()
export class AppUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly appService: AppService
	) {}

	@Start()
	async startCommand(ctx: Context) {
		await ctx.reply('Hi! Friend 👋')
		await ctx.reply('Что ты хочешь сделать?', actionButtons())
	}

	@Hears('⚡️ Создать задачу')
	async createTask(ctx: Context) {
		ctx.session.type = 'create'
		await ctx.reply('Опиши задачу: ')
	}

	@Hears('📋 Список задач')
	async listTask(ctx: Context) {
		const todos = await this.appService.getAll(ctx.message.from.id)
		await ctx.reply(showList(todos))
	}

	@Hears('✅ Завершить')
	async doneTask(ctx: Context) {
		ctx.session.type = 'done'
		await ctx.deleteMessage()
		await ctx.reply('Напиши ID задачи: ')
	}

	@Hears('✏️ Редактирование')
	async editTask(ctx: Context) {
		ctx.session.type = 'edit'
		await ctx.deleteMessage()
		await ctx.replyWithHTML(
			'Напиши ID и новое название задачи: \n\n' +
				'В формате - <b>1 | Новое название</b>'
		)
	}

	@Hears('❌ Удаление')
	async deleteTask(ctx: Context) {
		ctx.session.type = 'remove'
		await ctx.deleteMessage()
		await ctx.reply('Напиши ID задачи: ')
	}

	@On('text')
	async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
		if (!ctx.session.type) return

		const user_id = ctx.message.from.id

		if (ctx.session.type === 'create') {
			const todos = await this.appService.createTask(message, user_id)
			await ctx.reply(showList(todos))
		}

		if (ctx.session.type === 'done') {
			const todos = await this.appService.doneTask(Number(message), user_id)

			if (!todos) {
				await ctx.deleteMessage()
				await ctx.reply('Задачи с таким ID не найдено!')
				return
			}

			await ctx.reply(showList(todos))
		}

		if (ctx.session.type === 'edit') {
			const [taskId, taskName] = message.split(' | ')
			const todos = await this.appService.editTask(
				Number(taskId),
				taskName,
				user_id
			)

			if (!todos) {
				await ctx.deleteMessage()
				await ctx.reply('Задачи с таким ID не найдено!')
				return
			}

			await ctx.reply(showList(todos))
		}

		if (ctx.session.type === 'remove') {
			const todos = await this.appService.deleteTask(Number(message), user_id)

			if (!todos) {
				await ctx.deleteMessage()
				await ctx.reply('Задачи с таким ID не найдено!')
				return
			}

			await ctx.reply(showList(todos))
		}
	}
}
