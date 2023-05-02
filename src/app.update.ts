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
import { InlineKeybardMarkup } from 'telegram-bot-api'
import { AppService } from './app.service'
import { showList } from './app.utils'
import { Context } from './context.interface'
import { COMPLETE, CREATE_TASK, DELETE, EDIT_TASK, TO_DO } from './config'

@Update()
export class AppUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly appService: AppService
	) {}

	@Start()
	async startCommand(ctx: Context) {
		await ctx.reply('Hi! Friend 👋')
		await ctx.reply('Choose action🙂', actionButtons())
	}

	@Hears(CREATE_TASK)
	async createTask(ctx: Context) {
		ctx.session.type = 'create'
		await ctx.reply('Enter task details: ')
	}

	@Hears(TO_DO)
	async listTask(ctx: Context) {
		const todos = await this.appService.getAll(ctx.message.from.id)
		await ctx.replyWithHTML(
			`Your tasks: \n${todos
				.map(
					todo =>
						'id: ' +
						todo.id +
						' ' +
						todo.name +
						(todo.isCompleted ? ' ✅' : ' 🔘') +
						'\n'
				)
				.join('')}
				<a  type = "button" style="color:black;cursor:pointer"> Done</a>
				`
		)
	}

	@Hears(COMPLETE)
	async doneTask(ctx: Context) {
		ctx.session.type = 'done'
		await ctx.deleteMessage()
		await ctx.reply('enter task id: ')
	}

	@Hears(EDIT_TASK)
	async editTask(ctx: Context) {
		ctx.session.type = 'edit'
		await ctx.deleteMessage()
		await ctx.replyWithHTML(
			'Enter task id and new name : \n\n' +
				'In format - <b>1 | New name for task</b>'
		)
	}

	@Hears(DELETE)
	async deleteTask(ctx: Context) {
		ctx.session.type = 'remove'
		await ctx.deleteMessage()
		await ctx.reply('Enter task id: ')
	}

	@On('text')
	async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
		if (!ctx.session.type) return

		const user_id = ctx.message.from.id

		switch (ctx.session.type) {
			case 'create': {
				const todos = await this.appService.createTask(message, user_id)
				await ctx.replyWithHTML(showList(todos))
				break
			}

			case 'done': {
				const todos = await this.appService.doneTask(Number(message), user_id)

				if (!todos) {
					await ctx.deleteMessage()
					await ctx.reply('Taks by id does not found!')
					return
				}

				await ctx.reply(showList(todos))
				break
			}

			case 'edit': {
				const [taskId, taskName] = message.split(' | ')

				const todos = await this.appService.editTask(
					Number(taskId),
					taskName,
					user_id
				)

				if (!todos) {
					await ctx.deleteMessage()
					await ctx.reply('Taks by id does not found!')
					return
				}

				await ctx.reply(showList(todos))
				break
			}
			case 'remove': {
				const todos = await this.appService.deleteTask(Number(message), user_id)

				if (!todos) {
					await ctx.deleteMessage()
					await ctx.reply('Taks by id does not found!')
					return
				}

				await ctx.reply(showList(todos))
				break
			}
		}
	}
}
