import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TaskEntity } from './task.entity'

@Injectable()
export class AppService {
	constructor(
		@InjectRepository(TaskEntity)
		private readonly taskRepository: Repository<TaskEntity>
	) {}

	async getAll(user_id: number) {
		return this.taskRepository.findBy({ user_id })
	}

	async getById(id: number) {
		return this.taskRepository.findOneBy({ id })
	}

	async createTask(name: string, user_id: number) {
		const task = await this.taskRepository.create({ name, user_id })

		await this.taskRepository.save(task)
		return this.getAll(user_id)
	}

	async doneTask(id: number, user_id: number) {
		const task = await this.getById(id)
		if (!task) return null

		task.isCompleted = !task.isCompleted
		await this.taskRepository.save(task)
		return this.getAll(user_id)
	}

	async editTask(id: number, name: string, user_id: number) {
		const task = await this.getById(id)
		if (!task) return null

		task.name = name
		await this.taskRepository.save(task)

		return this.getAll(user_id)
	}

	async deleteTask(id: number, user_id: number) {
		const task = await this.getById(id)
		if (!task) return null

		await this.taskRepository.delete({ id })
		return this.getAll(user_id)
	}
}
