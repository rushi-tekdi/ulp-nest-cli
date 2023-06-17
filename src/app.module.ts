import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { AppService } from './app.service';

@Module({
  imports: [
    ConsoleModule, // import the ConsoleModule
  ],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
