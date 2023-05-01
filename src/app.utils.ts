export const showList = todos =>
	`Your tasks: \n\n${todos
		.map(
			todo =>
				(todo.id + ' ' + todo.isCompleted ? '✅' : '🔘') +
				' ' +
				todo.name +
				'\n\n'
		)
		.join('')}`
