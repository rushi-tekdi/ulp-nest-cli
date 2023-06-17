// service.ts - a nestjs provider using console decorators
import { Console, Command, createSpinner } from 'nestjs-console';

@Console()
export class AppService {
  @Command({
    command: 'ulp',
  })
  async ulpConsole(): Promise<void> {
    // See Ora npm package for details about spinner
    const spin = createSpinner();
    spin.start(`Listing files in directory`);

    // simulate a long task of 1 seconds
    let files = await new Promise((done) =>
      setTimeout(() => done(['fileA', 'fileB']), 5000),
    );

    spin.succeed('Listing done');
    console.log(JSON.stringify(files));
    console.log(JSON.stringify(files));

    spin.start(`Listing files in directory`);

    // simulate a long task of 1 seconds
    files = await new Promise((done) =>
      setTimeout(() => done(['fileC', 'fileD']), 5000),
    );

    spin.succeed('Listing done');

    // send the response to the  cli
    // you could also use process.stdout.write()
    console.log(JSON.stringify(files));
  }
}
