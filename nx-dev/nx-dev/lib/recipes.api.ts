import { DocumentsApi } from '@nrwl/nx-dev/data-access-documents/node-only';
import documents from '../public/documentation/manifests/document-recipes.json';
import { tagsApi } from './tags.api';

export const nxRecipesApi = new DocumentsApi({
  id: 'recipes',
  manifest: documents,
  prefix: '',
  publicDocsRoot: 'nx-dev/nx-dev/public/documentation',
  tagsApi,
});
