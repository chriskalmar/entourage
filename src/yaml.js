import yaml from 'js-yaml';

export const parseYaml = content => yaml.safeLoad(content);

export const parseYamlFile = filePath =>
  parseYaml(fs.readFileSync(filePath, 'utf8'));
