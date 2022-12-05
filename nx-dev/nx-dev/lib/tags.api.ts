import { TagsApi } from '@nrwl/nx-dev/data-access-documents/node-only';
import tags from '../public/documentation/manifests/tags.json';

export const tagsApi = new TagsApi(tags);
