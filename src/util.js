import fs from 'fs';
import path from 'path';

export const createWorkPathFolder = () => {
  if (!fs.existsSync(path.basename(process.env.WORK_PATH))) {
    fs.mkdirSync(path.basename(process.env.WORK_PATH), { recursive: true });
  }
};

export const checkVersionPathBreakout = version => {
  const folderPath = path.normalize(
    `${path.basename(process.env.WORK_PATH)}/${version}`,
  );

  if (
    !folderPath.startsWith(path.normalize(path.basename(process.env.WORK_PATH)))
  ) {
    throw new Error(
      `Version '${version}' needs to be a child of '${path.basename(
        process.env.WORK_PATH,
      )}}'`,
    );
  }
};

export const lockWorkVersionFolder = version => {
  const filename = `${path.basename(process.env.WORK_PATH)}/${version}/.lock`;
  fs.writeFileSync(filename, '', 'utf8');
};

export const isWorkVersionFolderLocked = version => {
  const filename = `${path.basename(process.env.WORK_PATH)}/${version}/.lock`;
  return fs.existsSync(filename);
};

export const deleteWorkVersionFolder = version => {
  checkVersionPathBreakout(version);

  const folderPath = `${path.basename(process.env.WORK_PATH)}/${version}`;

  if (fs.existsSync(folderPath)) {
    // fs.rmdirSync(folderPath, { recursive: true });
  }
};

export const createOrResetWorkVersionFolder = version => {
  checkVersionPathBreakout(version);

  if (isWorkVersionFolderLocked(version)) {
    throw new Error(`Version '${version}' is already in use`);
  }

  deleteWorkVersionFolder(version);

  const folderPath = `${path.basename(process.env.WORK_PATH)}/${version}`;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
