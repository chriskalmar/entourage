import { initBroker } from './broker';
import { createDockerNetwork } from './docker';
import { restartProxy, updateProxyConfig } from './proxy';
import { initRegistry } from './registry';
import { initServer } from './server';
import { createWorkPathFolder, printTask } from './util';

createDockerNetwork();
createWorkPathFolder();

printTask('Initializing registry');
initRegistry();

printTask('Updating proxy');
updateProxyConfig();

printTask('Restarting proxy');
restartProxy();

printTask('Start MQTT broker');
initBroker();

printTask('Start HTTP server');
initServer();
