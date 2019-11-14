import { template } from 'lodash';
import fs from 'fs';

export const render = (content, params) => {
  const compiled = template(content);
  const result = compiled(params);

  return result;
};

export const renderFile = (filePath, params) =>
  render(fs.readFileSync(filePath), params);
