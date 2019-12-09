import yaml from 'js-yaml';
import fs from 'fs';

export const parseYaml = content => yaml.safeLoad(content);

export const parseYamlFile = filePath =>
  parseYaml(fs.readFileSync(filePath, 'utf8'));

export const serializeYaml = content => yaml.safeDump(content);

export const serializeYamlFile = (content, filePath) =>
  fs.writeFileSync(filePath, serializeYaml(content), 'utf8');
