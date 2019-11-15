import fs from 'fs';
import path from 'path';

export const lockWorkVersionFolder = version => {
  const filename = `${path.basename(process.env.WORK_PATH)}/${version}/.lock`;
  fs.writeFileSync(filename, '', 'utf8');
};

export const createWorkPathFolder = () => {
  if (!fs.existsSync(path.basename(process.env.WORK_PATH))) {
    fs.mkdirSync(path.basename(process.env.WORK_PATH), { recursive: true });
  }
};

export const createWorkVersionFolder = version => {
  const folderPath = `${path.basename(process.env.WORK_PATH)}/${version}`;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
