import yargs from 'yargs';
import { init, env, wait } from './command';

const fn = argv => {
  console.log(JSON.stringify(argv, null, 2));
};

const versionNameParam = _yargs =>
  _yargs.positional('versionName', {
    type: 'string',
    describe: 'Version name for running the profile',
    required: true,
  });

const argv = yargs
  .strict()
  .scriptName('entourage-cli')
  .usage('$0 <cmd> [args]')
  .command(
    'init <versionName>',
    'Initialize new profile',
    _yargs => {
      versionNameParam(_yargs);
    },
    init,
  )
  .command(
    'wait <versionName> [seconds]',
    'Wait for profile to be ready',
    _yargs => {
      versionNameParam(_yargs);
      _yargs.positional('seconds', {
        type: 'number',
        default: '180',
        describe: 'Seconds to wait before timing out',
      });
    },
    wait,
  )
  .command(
    'env <versionName> [prefix]',
    'Export ports as environment variables',
    _yargs => {
      versionNameParam(_yargs);
      _yargs.positional('prefix', {
        type: 'string',
        default: 'PORT_',
        describe: 'Prefix for exported environment variables',
      });
    },
    env,
  )
  .command(
    'destroy <versionName>',
    'Destroy the profile',
    _yargs => {
      versionNameParam(_yargs);
    },
    fn,
  )
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
