import * as common from '@nestjs/common'
import * as typeorm from '@nestjs/typeorm'
import { TelegrafModule } from 'nestjs-telegraf'
import { join } from 'path'
import * as LocalSession from 'telegraf-session-local'
import { AppService } from './app.service'
import { AppUpdate } from './app.update'
import { TG_TOKEN } from './config'
import { TaskEntity } from './task.entity'

const sessions = new LocalSession({ database: 'session_db.json' })

@common.Module({
	imports: [
		TelegrafModule.forRoot({
			middlewares: [sessions.middleware()],
			token: TG_TOKEN
		}),
		typeorm.TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			database: 'nest',
			username: 'postgres',
			password: 'qwerty',
			entities: [join(__dirname, '**', '*.entity.{ts,js}')],
			migrations: [join(__dirname, '**', '*.migration.{ts,js}')],
			synchronize: true
		}),
		typeorm.TypeOrmModule.forFeature([TaskEntity])
	],
	providers: [AppService, AppUpdate]
})
export class AppModule {}
