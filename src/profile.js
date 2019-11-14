import fs from 'fs';
import path from 'path';
import { renderFile } from './render';

export const runProfile = profile => {
  let profileFilename;

  ['yaml', 'yml'].map(ext => {
    const filename = `${path.basename(
      process.env.PROFILES_PATH,
    )}/${profile}.${ext}`;

    if (fs.existsSync(filename)) {
      profileFilename = filename;
    }
  });

  if (!profileFilename) {
    throw new Error(`Profile '${profile}' not found`);
  }

  renderFile(profileFilename, {
    __PROFILE: profile,
  });

  return {};
};
