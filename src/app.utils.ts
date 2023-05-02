import { TaskEntity } from './task.entity'

export const showList = (todos: TaskEntity[]) => {
	return `Your tasks: \n${todos
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
		<button style="color:black"> Done</button>
		`
}
