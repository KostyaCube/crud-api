import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

type DB_TYPE = 'postgres';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<DB_TYPE>('DB_TYPE'),
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        entities:
          configService.get<string>('NODE_ENV') === 'test'
            ? ['src/**/*.entity{.js,.ts}']
            : ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/**/*{.ts,.js}'],
        timezone: 'Z',
        logging: false,
        migrationsRun: true,
        autoLoadEntities: true,
        synchronize: false,
        cli: { migrationsDir: 'src/migrations' },
      }),
    }),
  ],
})
export class DatabaseModule {}
