import yargs from 'yargs';

const fn = argv => {
  console.log(JSON.stringify(argv, null, 2));
};

const argv = yargs
  .strict()
  .scriptName('entourage-cli')
  .usage('$0 <cmd> [args]')
  .command('init', 'Initialize new profile', fn)
  .command(
    'wait [seconds]',
    'Wait for profile to be ready',
    _yargs => {
      _yargs.positional('seconds', {
        type: 'number',
        default: '180',
        describe: 'Seconds to wait before timing out',
      });
    },
    fn,
  )
  .command('env', 'Export ports as environment variables', fn)
  .command('destroy', 'Destroy the profile', fn)
  .options({
    file: {
      describe: 'config file location',
      alias: 'f',
      default: '.entourage.json',
    },
  })
  .help().argv;

if (!argv._[0]) {
  yargs.showHelp();
}
