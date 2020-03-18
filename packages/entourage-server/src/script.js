import execa from 'execa';
import { log } from 'util';
import { getWorkVersionFolder } from './util';

/**
 * @module Script
 */

/**
 * Execute a bash script from a work subfolder
 *
 * Optional timeout to kill the process
 *
 * @method module:Script~executeScript
 * @param {string} version
 * @param {string} script
 * @param {string} params
 * @param {number} [timeout]
 * @returns {Promise<number>} exitCode
 * @throws Script timed out: x.
 */
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

/**
 * Execute a series of bash scripts from a work subfolder
 *
 * Optional timeout to kill the process
 *
 * @method module:Script~executeScript
 * @param {string} version
 * @param {object} scripts
 * @param {string} params
 * @param {number} [timeout]
 * @throws Script execution failed with exit code x.
 */
export const executeScripts = async (version, scripts, params, timeout) => {
  for (const script of scripts) {
    const exitCode = await executeScript(version, script, params, timeout);

    if (exitCode !== 0) {
      throw new Error(`Script execution failed with exit code: ${exitCode}`);
    }
  }
};
