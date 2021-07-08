/* eslint-disable-next-line */
export interface FeatureItemProps {
  name: string;
  description: string;
  url: string;
}

export function FeatureItem({ name, description, url }: FeatureItemProps) {
  return (
    <div className="w-full flex flex-col py-8 px-6 border border-gray-100 rounded">
      <h3 className="text-lg font-semibold leading-tight mb-4">{name}</h3>
      <p className="sm:text-md">{description}</p>
    </div>
  );
}

export default FeatureItem;
