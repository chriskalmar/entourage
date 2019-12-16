import fs from 'fs';
import path from 'path';
import axios from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/json';

const readConfig = configPath => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file '${configPath}' not found`);
  }

  const content = require(path.resolve(configPath));

  return typeof content === 'function' ? content() : content;
};

const checkConfig = config => {
  if (typeof config === 'object') {
    if (config.url && config.profile) {
      return true;
    }
  }

  throw new Error('Invalid config');
};

export const init = async argv => {
  const config = readConfig(argv.file);
  checkConfig(config);

  try {
    console.log(`Contacting entourage server at ${config.url} ...`);

    const result = await axios({
      url: config.url,
      method: 'POST',
      json: true,
      data: {
        query: `
          mutation runProfile(
            $version: String!
            $profile: String!
            $params: JSON!
          ) {
            runProfile(
              version: $version
              profile: $profile
              params: $params
              asyncMode: true
            )
          }
        `,
        variables: {
          profile: config.profile,
          params: config.params || {},
          version: argv.versionName,
        },
      },
    });

    const body = result.data;

    if (body.errors && body.errors.length) {
      throw new Error(body.errors[0].message);
    }
  } catch (e) {
    if (e.response) {
      console.error(JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e.message);
    }

    process.exit(1);
  }
};
