import execa from 'execa';
import { log } from 'util';
import { getWorkVersionFolder } from './util';

export const executeScript = async (
  version,
  script,
  params,
  timeout = 1000 * 60 * 3,
) => {
  const cwd = getWorkVersionFolder(version);

  let subprocess;
  let timedOut = false;

  const timeoutFn = setTimeout(() => {
    timedOut = true;

    subprocess.kill('SIGTERM', {
      forceKillAfterTimeout: 2000,
    });
  }, timeout);

  log(`\n${script}\n`);

  try {
    subprocess = execa('sh', ['-c', script], {
      cwd,
      env: params,
    });

    subprocess.stdout.pipe(process.stdout);
    subprocess.stderr.pipe(process.stderr);

    const { exitCode } = await subprocess;
    clearTimeout(timeoutFn);

    return exitCode;
  } catch (error) {
    clearTimeout(timeoutFn);

    if (timedOut) {
      throw new Error(`Script timed out: \n${script}`);
    }

    throw error;
  }
};

export const executeScripts = async (version, scripts, params, timeout) => {
  for (const script of scripts) {
    const exitCode = await executeScript(version, script, params, timeout);

    if (exitCode !== 0) {
      throw new Error(`Script execution failed with exit code: ${exitCode}`);
    }
  }
};
