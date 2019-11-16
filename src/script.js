import execa from 'execa';
import fs from 'fs';
import path from 'path';

export const executeScript = async (version, script, params) => {
  const cwd = path.normalize(
    `${path.basename(process.env.WORK_PATH)}/${version}`,
  );

  try {
    const { stdout } = await execa('sh', ['-c', script], {
      cwd,
      env: params,
    });

    console.log(stdout);
  } catch (error) {
    const { stdout, stderr } = error;

    console.log(stdout);
    console.log(stderr);

    throw new Error(stderr);
  }
};
