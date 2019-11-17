export const registry = {};

export const addWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  registry[key] = config;
};
