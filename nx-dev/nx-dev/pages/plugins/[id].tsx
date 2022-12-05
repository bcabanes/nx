import { useRouter } from 'next/router';

export default function PluginsId() {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <>
      <h1>Plugins: {id}</h1>
    </>
  );
}
