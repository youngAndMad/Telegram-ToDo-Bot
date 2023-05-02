import { Markup } from 'telegraf'
import { COMPLETE, CREATE_TASK, DELETE, EDIT_TASK, TO_DO } from './config'

export function actionButtons() {
	return Markup.keyboard(
		[
			Markup.button.callback(CREATE_TASK, 'create'),
			Markup.button.callback(TO_DO, 'list'),
			Markup.button.callback(COMPLETE, 'done'),
			Markup.button.callback(EDIT_TASK, 'edit'),
			Markup.button.callback(DELETE, 'delete')
		],
		{
			columns: 2
		}
	)
}
