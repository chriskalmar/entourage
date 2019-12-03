import execa from 'execa';
import fs from 'fs';
import path from 'path';

export const executeScript = async (version, script, params) => {
  const cwd = path.normalize(
    `${path.basename(process.env.WORK_PATH)}/${version}`,
  );

  try {
    const subprocess = execa('sh', ['-c', script], {
      cwd,
      env: params,
    });

    subprocess.stdout.pipe(process.stdout);
    subprocess.stderr.pipe(process.stderr);

    const { exitCode } = await subprocess;
    return exitCode;
  } catch (error) {
    const { stderr } = error;
    throw new Error(stderr);

export const executeScripts = async (version, scripts, params, timeout) => {
  for (const script of scripts) {
    const exitCode = await executeScript(version, script, params, timeout);

    if (exitCode !== 0) {
      throw new Error(`Script execution failed with exit code: ${exitCode}`);
    }
  }
};
