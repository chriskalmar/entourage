import fs from 'fs';
import path from 'path';

export const createWorkPathFolder = () => {
  if (!fs.existsSync(path.basename(process.env.WORK_PATH))) {
    fs.mkdirSync(path.basename(process.env.WORK_PATH), { recursive: true });
  }
};

export const createNamedWorkFolder = name => {
  const folderPath = `${path.basename(process.env.WORK_PATH)}/${name}`;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
