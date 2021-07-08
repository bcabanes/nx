import cx from 'classnames';
import Link from 'next/link';
import React from 'react';
import { FeatureItem } from './feature-item';

export interface FeatureListProps {
  useDarkBackground: boolean;
}
export function FeatureList({ useDarkBackground }: FeatureListProps) {
  const featureList = [
    {
      name: 'Complete Monorepo Support',
      description:
        "Nx ensures that adding another app to the repo does not increase the existing app's test or build time.",
      url: '',
    },
    {
      name: 'Computation Caching',
      description:
        'Building is a long process, Nx will save you time by building only the thing that changed.',
      url: '',
    },
    {
      name: 'Cloud Caching',
      description:
        'Share cloud build cache with your teammates and CI/CD to ship even faster.',
      url: '',
    },
    {
      name: 'Distributed Builds',
      description:
        "Smart and automated way to run multiple builds at the same time using 100% of your machine's capability.",
      url: '',
    },
    {
      name: 'Dependency Graph',
      description:
        'Check what is impacted by the changes recently made, visualize the produced graph and only rebuild what is required.',
      url: '',
    },
    {
      name: 'Graph Analysis',
      description:
        'Interact with the dependency graph with the browser and see how your apps & libs interact with each others.',
      url: '',
    },
    {
      name: 'Fast & Powerful CLI',
      description:
        'Nx CLI helps you setup, develop, build and maintain your applications in your monorepo.',
      url: '',
    },
    {
      name: 'Plugins',
      description:
        'It has support for TypeScript, React, Angular, Cypress, Jest, Prettier, Nest.js, Next.js, Storybook, Ionic and much more!',
      url: '',
    },
    {
      name: 'Generators & Executors',
      description:
        'Nx provides you with the ability to generate and execute code for you and your team, entirely customizable.',
      url: '',
    },
    {
      name: 'VsCode Plugins',
      description:
        'Spend less time looking up command line arguments and more time shipping incredible product with NxConsole',
      url: '',
    },
    {
      name: 'Update & Migration Support',
      description:
        'Nx provides the migrate command which help you stay up to date with the latest version of Nx.',
      url: '',
    },
    {
      name: 'Nx Devkit',
      description:
        "Take full control of Nx's powers by using the devkit to create plugins, generators and executors to extend Nx capabilities to fit your own needs.",
      url: '',
    },
    {
      name: 'Video Courses & Tutorials',
      description:
        "With accessible and free online content, you can quickly get up and running with all Nx' features.",
      url: '',
    },
    {
      name: 'Manage Code & Boundaries',
      description:
        'With powerful tools to your disposal it has never been as easy to enforce custom rules and code ownership throughout the repository.',
      url: '',
    },
    {
      name: 'Architecture Guidance',
      description:
        'Splitting things up is an art, we give you guidelines that we think work best from experience.',
      url: '',
    },
    {
      name: 'Open Source Maintainer Ready',
      description:
        'We know the struggles and requirements open source package have, we think Nx will help you remove most of the bump on the road.',
      url: '',
    },
    {
      name: 'Configure Everything',
      description:
        "You can configure your monorepo and Nx's behavior how you like it, like all true power users.",
      url: '',
    },
  ];
  return (
    <div className="max-w-screen xl:max-w-screen-xl mx-auto px-5 py-5">
      <div className="my-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((plugin) => (
          <FeatureItem
            key={plugin.name}
            name={plugin.name}
            description={plugin.description}
            url={plugin.url}
          />
        ))}
      </div>
    </div>
  );
}

export default FeatureList;
