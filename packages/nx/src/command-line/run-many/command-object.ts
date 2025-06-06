import { CommandModule } from 'yargs';
import { handleErrors } from '../../utils/handle-errors';
import { linkToNxDevAndExamples } from '../yargs-utils/documentation';
import {
  withBatch,
  withOutputStyleOption,
  withOverrides,
  withRunManyOptions,
  withTargetAndConfigurationOption,
  withTuiOptions,
} from '../yargs-utils/shared-options';

export const yargsRunManyCommand: CommandModule = {
  command: 'run-many',
  describe: 'Run target for multiple listed projects.',
  builder: (yargs) =>
    linkToNxDevAndExamples(
      withTuiOptions(
        withRunManyOptions(
          withOutputStyleOption(
            withTargetAndConfigurationOption(withBatch(yargs))
          )
        )
      ),
      'run-many'
    ),
  handler: async (args) => {
    const exitCode = await handleErrors(
      (args.verbose as boolean) ?? process.env.NX_VERBOSE_LOGGING === 'true',
      async () => {
        await import('./run-many').then((m) => m.runMany(withOverrides(args)));
      }
    );
    process.exit(exitCode);
  },
};
