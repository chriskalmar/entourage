export const registry = {};

export const addWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  registry[key] = config;
};

export const getWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  return registry[key]
};
