import {
  PackageMetadata,
  ProcessedPackageMetadata,
} from '../../nx-dev/models-package/src';
import { ensureDir, readJsonSync, writeFileSync } from 'fs-extra';
import { resolve } from 'path';
import {
  convertToDocumentMetadata,
  createDocumentMetadata,
  DocumentMetadata,
} from '../../nx-dev/models-document/src';
import { MenuItem } from '../../nx-dev/models-menu/src';

const targetFolder: string = resolve(
  __dirname,
  '../../',
  `./nx-dev/nx-dev/public/documentation/manifests`
);
const basePath = 'docs';
const documents: Partial<DocumentMetadata>[] = readJsonSync(
  `${basePath}/map.json`,
  {
    encoding: 'utf8',
  }
).content;
const packages: PackageMetadata[] = readJsonSync(
  `${basePath}/packages-metadata.json`,
  {
    encoding: 'utf8',
  }
);

const fileList: {
  name: string;
  content: Partial<DocumentMetadata>[];
  prefix: string;
}[] = [
  {
    name: 'nx',
    content: documents.find((x) => x.id === 'nx-documentation')!
      .itemList as Partial<DocumentMetadata>[],
    prefix: '',
  },
  {
    name: 'recipes',
    content: documents.find((x) => x.id === 'nx-recipes')!
      .itemList as Partial<DocumentMetadata>[],
    prefix: 'recipes',
  },
  {
    name: 'cloud',
    content: documents.find((x) => x.id === 'nx-cloud-documentation')!
      .itemList as Partial<DocumentMetadata>[],
    prefix: 'nx-cloud',
  },
];

function generatePath(
  item: { path: string; id: string },
  prefix: string = ''
): string {
  const isLinkExternal: (p: string) => boolean = (p: string) =>
    p.startsWith('http');
  const isLinkAbsolute: (p: string) => boolean = (p: string) =>
    p.startsWith('/');

  if (!item.path)
    return '/' + [...prefix.split('/'), item.id].filter(Boolean).join('/');
  if (isLinkAbsolute(item.path) || isLinkExternal(item.path)) return item.path;
  return (
    '/' +
    [...prefix.split('/'), ...item.path.split('/')].filter(Boolean).join('/')
  );
}

/**
 * Handle data interpolation for all items and their children.
 * @param target
 * @param parent
 */
function documentRecurseOperations(
  target: DocumentMetadata,
  parent: DocumentMetadata
): DocumentMetadata {
  const document: DocumentMetadata = Object.assign({}, target);

  /**
   * Calculate `path`
   */
  if (!!parent) document.path = generatePath(target, parent.path);
  else document.path = generatePath(document);

  /**
   * Calculate `isExternal`
   */
  if (document['isExternal'] === undefined) {
    document.isExternal = document.path.startsWith('http');
  }

  if (!!target.itemList.length) {
    document.itemList = target.itemList.map((i) =>
      documentRecurseOperations(i, document)
    );
  }

  return document;
}

function populateDictionary(
  document: DocumentMetadata,
  dictionary: Record<string, DocumentMetadata>
) {
  if (document.path.startsWith('http')) return;
  dictionary[document.path] = document;

  document.itemList.forEach((item: DocumentMetadata) =>
    populateDictionary(item, dictionary)
  );
}

// What we want is a dictionary Record<string, Document>
const recordList: {
  id: string;
  records: Record<string, DocumentMetadata | ProcessedPackageMetadata>;
}[] = fileList.map((file) => {
  const records: Record<string, DocumentMetadata> = {};
  file.content
    .map((item: any) => convertToDocumentMetadata(item))
    .map((item: DocumentMetadata) =>
      documentRecurseOperations(
        item,
        createDocumentMetadata({ id: file.name, path: file.prefix })
      )
    )
    .forEach((item: DocumentMetadata) => {
      populateDictionary(item, records);
    });

  return {
    id: file.name,
    records,
  };
});

// Create packages dictionary mapping
function convertToDictionary<OBJECT>(
  arr: OBJECT[],
  ref: PropertyKey
): Record<PropertyKey, OBJECT> {
  return Object.fromEntries(
    arr.map((a) => {
      function assertRef(
        value: PropertyKey,
        target: OBJECT
      ): value is keyof OBJECT {
        return value in target;
      }
      if (!assertRef(ref, a))
        throw new Error(
          `Property '${ref.toString()}' can not be found in passed object.`
        );
      return [a[ref], a];
    })
  );
}
const packagesManifest: {
  id: string;
  records: Record<string, ProcessedPackageMetadata>;
} = { id: 'packages', records: {} };

packages.forEach((p) => {
  packagesManifest.records[p.name] = {
    githubRoot: p.githubRoot,
    name: p.name,
    packageName: p.packageName,
    description: p.description,
    documents: convertToDictionary(
      p.documents.map((d) =>
        documentRecurseOperations(
          d,
          createDocumentMetadata({ id: p.name, path: 'packages/' })
        )
      ),
      'path'
    ),
    root: p.root,
    source: p.source,
    executors: convertToDictionary(
      p.executors.map((e) => ({
        ...e,
        path: generatePath({ id: e.name, path: e.path }, 'packages'),
      })),
      'path'
    ),
    generators: convertToDictionary(
      p.generators.map((g) => ({
        ...g,
        path: generatePath({ id: g.name, path: g.path }, 'packages'),
      })),
      'path'
    ),
    path: generatePath({ id: p.name, path: '' }, 'packages'),
  };
});

const packagesMenu: MenuItem[] = Object.values(packagesManifest.records).map(
  (p) => {
    const item: MenuItem = {
      id: p.name,
      path: '/packages/' + p.name,
      name: p.name,
      children: [],
      isExternal: false,
      disableCollapsible: false,
    };

    if (!!Object.values(p.documents).length) {
      // Might need to remove the path set in the "additional api resources" items
      item.children.push({
        id: 'documents',
        path: '/' + ['packages', p.name, 'documents'].join('/'),
        name: 'documents',
        children: Object.values(p.documents).map((d) =>
          menuItemRecurseOperations(d)
        ),
        isExternal: false,
        disableCollapsible: false,
      });
    }

    if (!!Object.values(p.executors).length) {
      item.children.push({
        id: 'executors',
        path: '/' + ['packages', p.name, 'executors'].join('/'),
        name: 'executors',
        children: Object.values(p.executors).map((e) => ({
          id: e.name,
          path: '/' + ['packages', p.name, 'executors', e.name].join('/'),
          name: e.name,
          children: [],
          isExternal: false,
          disableCollapsible: false,
        })),
        isExternal: false,
        disableCollapsible: false,
      });
    }

    if (!!Object.values(p.generators).length) {
      item.children.push({
        id: 'generators',
        path: '/' + ['packages', p.name, 'generators'].join('/'),
        name: 'generators',
        children: Object.values(p.generators).map((g) => ({
          id: g.name,
          path: '/' + ['packages', p.name, 'generators', g.name].join('/'),
          name: g.name,
          children: [],
          isExternal: false,
          disableCollapsible: false,
        })),
        isExternal: false,
        disableCollapsible: false,
      });
    }
    return item;
  }
);

recordList.push(packagesManifest);

// Creates menus dictionary mapping
function menuItemRecurseOperations(target: DocumentMetadata): MenuItem {
  const menuItem: MenuItem = {
    name: target.name,
    path: target.path,
    id: target.id,
    isExternal: target.isExternal,
    children: [],
    disableCollapsible: false,
  };
  /**
   * Calculate `isExternal`
   */
  if (menuItem['isExternal'] === undefined) {
    menuItem.isExternal = menuItem.path.startsWith('http');
  }

  if (!!target.itemList.length) {
    menuItem.children = target.itemList.map((i) =>
      menuItemRecurseOperations(i)
    );
  }

  return menuItem;
}
const menuList: {
  id: string;
  menu: MenuItem[];
}[] = recordList
  .filter(
    (r): r is { id: string; records: Record<string, DocumentMetadata> } =>
      r.id !== 'packages'
  )
  .map((record) => ({
    id: record.id,
    menu: Object.values(record.records)
      .map((item: any) => convertToDocumentMetadata(item))
      .map((item: DocumentMetadata) => menuItemRecurseOperations(item)),
  }));
menuList.push({ id: 'packages', menu: packagesMenu });

// Create tags dictionary mapping
const tagList: Record<
  string,
  {
    description: string;
    file: string;
    id: string;
    name: string;
    path: string;
  }[]
> = {};
recordList.map((file) => {
  for (let key in file.records) {
    const item: DocumentMetadata | ProcessedPackageMetadata = file.records[key];

    const isDocument = (
      e: DocumentMetadata | ProcessedPackageMetadata
    ): e is DocumentMetadata => !('packageName' in e);
    const isPackage = (
      e: DocumentMetadata | ProcessedPackageMetadata
    ): e is ProcessedPackageMetadata => 'packageName' in e;

    if (isDocument(item))
      item.tags.forEach((t) => {
        const tagData = {
          description: item.description,
          file: item.file,
          id: item.id,
          name: item.name,
          path: item.path,
        };
        !tagList[t] ? (tagList[t] = [tagData]) : tagList[t].push(tagData);
      });

    if (isPackage(item))
      Object.keys(item.documents).forEach((e) => {
        item.documents[e].tags.forEach((t: string) => {
          const tagData = {
            description: item.documents[e].description,
            file: ['generated', 'packages', item.documents[e].file].join('/'),
            id: item.documents[e].id,
            name: item.documents[e].name,
            path: ['packages', item.documents[e].path].join('/'),
          };
          !tagList[t] ? (tagList[t] = [tagData]) : tagList[t].push(tagData);
        });
      });
  }
});

// Creating files
recordList.forEach((manifest) => {
  ensureDir(targetFolder).then(() => {
    writeFileSync(
      resolve(targetFolder + `/document-${manifest.id}.json`),
      JSON.stringify(manifest.records)
    );
  });
});
ensureDir(targetFolder).then(() => {
  writeFileSync(resolve(targetFolder + `/tags.json`), JSON.stringify(tagList));
});
ensureDir(targetFolder).then(() => {
  writeFileSync(
    resolve(targetFolder + `/menus.json`),
    JSON.stringify(menuList)
  );
});
