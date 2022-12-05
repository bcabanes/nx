import { RelatedDocument } from '@nrwl/nx-dev/models-document';

export class TagsApi {
  private readonly manifest: Record<string, RelatedDocument[]>;
  constructor(private readonly tags: Record<string, RelatedDocument[]>) {
    if (!tags) {
      throw new Error('tags property cannot be undefined');
    }

    this.manifest = Object.assign({}, this.tags);
  }

  getAssociatedItems(tag: string): RelatedDocument[] {
    const items: RelatedDocument[] | null = this.manifest[tag] || null;

    if (!items) throw new Error(`No associated items found for tag: "${tag}"`);

    return items;
  }
}
