import { GetStaticPaths } from 'next';
import { nxPackagesApi } from '../../../../lib/packages.api';

export default function PackageDocuments() {}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      ...nxPackagesApi.getStaticDocumentPaths().map((x) => ({
        params: {
          name: x.params.segments.slice(2)[0],
        },
      })),
    ],
    fallback: 'blocking',
  };
};

export async function getStaticProps({ params }: { params: { name: string } }) {
  return {
    redirect: {
      destination: `/packages/${params.name}`,
      permanent: true,
    },
  };
}
