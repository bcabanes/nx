import { join, resolve } from 'path';
import { generateManifests } from './generate-manifests';

const workspaceRoot = resolve(__dirname, '../../../');

generateManifests(workspaceRoot).finally(() =>
  console.log('Manifests generation done.')
);
