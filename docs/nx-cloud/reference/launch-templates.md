# Launch Templates

A launch template defines the setup steps Nx Agents will run before running tasks. A custom launch template isn't required to use Nx Agents.
Nx Cloud provides several pre-built launch templates for common use-cases. You can view available templates in the [`nx-cloud-workflows` repository](https://github.com/nrwl/nx-cloud-workflows/tree/main/launch-templates).

{% github-repository url="https://github.com/nrwl/nx-cloud-workflows/tree/main/launch-templates" title="Pre-Built Launch Templates" /%}

## Getting Started with Custom Launch Templates

The easiest way to create a new custom launch template is to modify one of the pre-built ones. To do that, create a file in the
`.nx/workflows` folder and copy one of the [pre-built templates](https://github.com/nrwl/nx-cloud-workflows/blob/main/launch-templates/linux.yaml). You can name the file any way you want (e.g., `agents.yaml`) and customize the steps as needed.

## Launch Template Structure

### `launch-templates`

A `map` of launch template configurations. This value is required.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
```

### `launch-templates.<template-name>`

The name of your custom launch template. This name is used via `--distribute-on="<# of agents> <template-name>"` when starting the ci run. Supports one to many uniquely named launch templates.
Multiple launch templates can be useful for setting up different toolchains (rust, java, node versions) or resources classes for your workspace needs.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
  template-two:
```

```
nx-cloud start-ci-run --distribute-on="3 template-one"
```

### `launch-templates.<template-name>.resource-class`

A launch template's `resource-class` defines the memory and vCPUs available to each agent machine.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    resource-class: 'docker_linux_amd64/medium'
```

The following resource classes are available:

- `docker_linux_amd64/small`
- `docker_linux_amd64/medium`
- `docker_linux_amd64/medium+`
- `docker_linux_amd64/large`
- `docker_linux_amd64/large+`
- `docker_linux_amd64/extra_large`
- `docker_linux_amd64/extra_large+`
- `docker_linux_arm64/medium`
- `docker_linux_arm64/large`
- `docker_linux_arm64/extra_large`
- `windows/medium`

See their detailed description and pricing at [nx.dev/pricing](/pricing#plan-detail?sutm_source=nx.dev&utm_medium=launch-templates).

### `launch-templates.<template-name>.image`

A launch template's `image` defines the available base software for the agent machine.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    image: 'ubuntu22.04-node20.11-v9'
```

Nx Cloud provides the following images:

> Changes added in previous images are included in newer images unless otherwise denoted
> Images also have [go 1.22](https://go.dev/) installed

- `ubuntu22.04-node20.11-v5`
  - added elevated permission access via `sudo`
- `ubuntu22.04-node20.11-v6`

  - `corepack` is enabled by default
  - default global package manager versions:
    - `npm` v10
    - `yarn` v1
    - `pnpm` v8
    - See how to install a [specific package manger version](#specific-package-manager-version)

- `ubuntu22.04-node20.11-v7`
  - added java version 17
- `ubuntu22.04-node20.11-v9`
  - added [nvm](https://github.com/nvm-sh/nvm)
- `windows-2022`

> Note: Windows-based images can only run on Windows-based [resource classes](#launch-templatestemplate-nameresourceclass).

Enterprise accounts can use custom images.

### `launch-templates.<template-name>.env`

A launch template's `env` defines a `map` of environment variable names and values to be available within **all** steps of the specific launch template.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    env:
      MY_ENV_VAR: 'my-var-value'
```

### `launch-templates.<template-name>.init-steps`

A launch template's `init-steps` defines the series of steps to perform before an Nx Agent runs. Without a defined `init-steps` the Nx Agent is unable to process any tasks.

Typical `init-steps` perform actions such as checking out your workspace source code and installing any necessary dependencies. Any extra setup your workspace needs to run should be defined as an `init-step`. Once all steps run successfully, the agent machine will inform Nx Cloud that it is ready to accept tasks.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    init-steps:
```

### `launch-templates.<template-name>.init-steps[*].name`

An init-step's `name` is the label that will be reflected in the Nx Cloud UI. `name` can be used in conjunction with [`uses`](#launch-templatestemplate-nameinit-stepsuses) and [`script`](#launch-templatestemplate-nameinit-stepsscript)

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    init-steps:
      - name: 'My Helpful Step Name'
```

### `launch-templates.<template-name>.init-steps[*].uses`

When defined, specifies an existing step file to be used. **Cannot be used when `script` is also defined**

You can find the [list of Nx Cloud reusable steps here](https://github.com/nrwl/nx-cloud-workflows/tree/main/workflow-steps). If you cannot find a reusable step that suits your needs, [you can create your own custom steps](/ci/reference/custom-steps).

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    init-steps:
      - uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/checkout/main.yaml'
      - name: 'Install Node Modules'
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-node-modules/main.yaml'
```

### `launch-templates.<template-name>.init-steps[*].script`

When defined, allows an inline script to be run. **Cannot be used when `uses` is also defined**

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    init-steps:
      - name: 'Print Node Version and PATH'
        script: |
          node -v
          echo $PATH
```

### `launch-templates.<template-name>.init-steps[*].env`

An init-step's `env` is similar to the [`launch-template.<template-name>.env`](#launch-templatestemplate-nameenv), except the environment variable `map` is **scoped for the current step only**.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    init-steps:
      - name: 'Print Env'
        env:
          MY_STEP_ENV: 'step-env-var'
        script: |
          echo $MY_STEP_ENV # prints "step-env-var"
```

### `launch-templates.<template-name>.init-steps[*].inputs`

An init-step's `inputs` is defined by the step file in the [`launch-template.<template-name>.init-steps[*].uses`](#launch-templatestemplate-nameinit-stepsuses) property. Refer to the step file's documentation for specific inputs.

[Validation](#validating-launch-templates) can also be done to validate the step against the step file's defined inputs

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    init-steps:
      - name: Restore Node Modules Cache
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/cache/main.yaml'
        inputs:
          key: 'package-lock.json|yarn.lock|pnpm-lock.yaml'
          paths: |
            ~/.npm
            # or ~/.cache/yarn
            # or .pnpm-store
          base-branch: 'main'
```

### `launch-templates.<template-name>.group-name`

You can define "step groups" that run in parallel. This can be useful for taking better advantage of the available CPUs of your chosen resource class.
In the example below, we can run NPM Install and install the Rust dependencies in parallel, because they do not depend on each other and they write to different places on the filesystem.
Running them in parallel can reduce agent startup time by up to 2 minutes, which can add up to a lot of compute time savings over the month.

⚠️ Tips for using parallel steps:

- don't assume everything can be run in parallel
  - you'll notice below we had to run `playwright install` after the parallel group, as it was likely writing to the same locations and fighting for similar resources to `npm install`
  - experiment with different parallel groups and measure startup times until you land on the most optimal config for your use-case
- write to PATH once
  - multiple parallel processes can overwrite each other's changes if they write to the same `>> $NX_CLOUD_ENV` location
  - below, we only update the PATH variable once at the end `echo "PATH=$CARGO_PATH:$POETRY_PATH:$PATH" >> $NX_CLOUD_ENV`

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  template-one:
    init-steps:
      - group-name: Install Dependencies
        parallel: true
        # all the below steps will start at the same time and run in parallel
        steps:
          - name: Install Rust
            script: |
              curl --proto '=https' --tlsv1.3 https://sh.rustup.rs -sSf | sh -s -- -y
              source "~/workspace/.cargo/env"
              # we write the CARGO_PATH now so that it can be set in the "Start Services" step below
              echo "CARGO_PATH=~/workspace/.cargo/bin" >> $NX_CLOUD_ENV
              rustc --version
              rustup target add wasm32-wasip1-threads
              cargo fetch
              cargo check --locked
          - name: NPM Install
            uses: 'nrwl/nx-cloud-workflows/main/workflow-steps/install-node-modules/main.yaml'
          - name: Install Poetry
            script: |
              curl -sSL https://install.python-poetry.org | python3 -
              # we write the POETRY_PATH now so that it can be set in the "Start Services" step below
              export POETRY_PATH="/home/workflows/.local/bin"
              export PATH="$POETRY_PATH:$PATH"
              echo "POETRY_PATH=$POETRY_PATH" >> $NX_CLOUD_ENV
              poetry --version
              poetry install
          - name: Install Localstack
            script: |
              curl --output localstack-cli-3.7.0-linux-amd64-onefile.tar.gz --location https://github.com/localstack/localstack-cli/releases/download/v3.7.0/localstack-cli-3.7.0-linux-amd64-onefile.tar.gz
              sudo tar xvzf localstack-cli-3.7.0-linux-*-onefile.tar.gz -C /usr/local/bin
      # because both playwright and "npm install" use NPM and write to a lot of the same places on the filesystem, it would be slower to run them both in parallel
      # so we run playwright after the parallel group above
      - name: Install Playwright
        script: npx playwright install --with-deps
      - name: Start services
        script: |
          # we create the PATH here
          echo "PATH=$CARGO_PATH:$POETRY_PATH:$PATH" >> $NX_CLOUD_ENV
          npm run start-docker-services
```

We can also group steps and run them serially. This is actually the default behaviour when you don't set `parallel: true` for a group.

This can be useful if we have a set of quick enough steps, such as restoring from cache, where we don't need to optimise for speed, and instead we just want them
grouped together logically. The below cache steps will also be collapsed together in the Agents UI, making the config look cleaner:

```yaml
- group-name: Restore Cache
  steps:
    - name: Restore Node Modules Cache
      uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/cache/main.yaml'
      inputs:
        key: 'package-lock.json'
        paths: |
          ~/.npm
        base-branch: 'main'
    - name: Restore Browser Binary Cache
      uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/cache/main.yaml'
      inputs:
        key: 'package-lock.json|"browsers"'
        paths: |
          '~/.cache/Cypress'
        base-branch: 'main'
```

## Full Example

This is an example of a launch template using all pre-built features:

```yaml {% fileName="./nx/workflows/agents.yaml" %}
common-init-steps: &common-init-steps
  - name: Checkout
    # using a reusable step in an external GitHub repo,
    # this step is provided by Nx Cloud: https://github.com/nrwl/nx-cloud-workflows/tree/main/workflow-steps
    uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/checkout/main.yaml'
  # group these steps together as they related (it doesn't change anything functionally, but it helps with organising your steps as they will be collapsed together in the UI)
  - group-name: Restore Cache
    steps:
      - name: Restore Node Modules Cache
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/cache/main.yaml'
        # the cache step requires configuration via env vars
        # https://github.com/nrwl/nx-cloud-workflows/tree/main/workflow-steps/cache#options
        inputs:
          key: 'package-lock.json|yarn.lock|pnpm-lock.yaml'
          paths: |
            ~/.npm
            # or ~/.cache/yarn
            # or .pnpm-store
          base-branch: 'main'
      - name: Restore Browser Binary Cache
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/cache/main.yaml'
        inputs:
          key: 'package-lock.json|yarn.lock|pnpm-lock.yaml|"browsers"'
          paths: |
            '~/.cache/Cypress'
          base-branch: 'main'
  - name: Install Node Modules
    uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-node-modules/main.yaml'
  - name: Install Browsers (if needed)
    uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-browsers/main.yaml'
    # You can also run a custom script to configure various things on the agent machine
  - name: Run a custom script
    script: |
      git config --global user.email test@test.com
      git config --global user.name "Test Test"
  # You can also set any other env vars to be passed to the following steps
  # by setting their value in the `$NX_CLOUD_ENV` file.
  # Most commonly for redefining PATH for further steps
  - name: Setting env
    script: |
      # Update PATH with custom value
      echo "PATH=$HOME/my-folder:$PATH" >> $NX_CLOUD_ENV
  - name: Print path from previous step
    # will include my-folder
    script: echo $PATH
  - name: Define env var for a step
    env:
      MY_ENV_VAR: 'env-var-for-step'
    # will print env-var-for-step
    script: echo $MY_ENV_VAR
  # after you're last step Nx Agents will start accepting tasks to process
  # no need to manually start up the agent yourself

launch-templates:
  # Custom template name, the name is referenced via --distribute-on="3 my-linux-medium-js"
  # You can define as many templates as you need, commonly used to make different sizes or toolchains depending on your workspace needs
  my-linux-medium-js:
    # see the available resource list below
    resource-class: 'docker_linux_amd64/medium'
    # see the available image list below
    image: 'ubuntu22.04-node20.11-v9'
    # Define environment variables shared among all steps
    env:
      MY_ENV_VAR: shared
      # list out steps to run on the agent before accepting tasks
      # the agent will need a copy of the source code and dependencies installed
      # note we are using yaml anchors te reduce duplication with the below launch-template (they have the same init-steps)
    init-steps: *common-init-steps

  # another template which does the same as above, but with a large resource class
  # You're not required to define a template for every resource class, only define what you need!
  my-linux-large-js:
    resource-class: 'docker_linux_amd64/large'
    image: 'ubuntu22.04-node20.11-v9'
    env:
      MY_ENV_VAR: shared
      # note we are using yaml anchors te reduce duplication with the above launch-template (they have the same init-steps)
    init-steps: *common-init-steps

  # template that installs rust
  my-linux-rust-large:
    resource-class: 'docker_linux_amd64/large'
    image: 'ubuntu22.04-node20.11-v9'
    init-steps:
      - name: Checkout
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/checkout/main.yaml'
      - name: Restore Node Modules Cache
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/cache/main.yaml'
        inputs:
          key: 'package-lock.json|yarn.lock|pnpm-lock.yaml'
          paths: |
            ~/.npm
            # or ~/.cache/yarn
            # or .pnpm-store
          base-branch: 'main'
      - name: Install Node Modules
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-node-modules/main.yaml'
      - name: Install Rust
        script: |
          curl --proto '=https' --tlsv1.3 https://sh.rustup.rs -sSf | sh -s -- -y
          source "$HOME/.cargo/env"
          rustup toolchain install 1.70.0
          # persist cargo bin into PATH
          echo "PATH=$HOME/.cargo/bin:$PATH" >> $NX_CLOUD_ENV
```

These templates can be used by passing the number of agents desired, and the template name via `--distribute-on` when starting your CI run.

```
nx-cloud start-ci-run --distribute-on="4 my-linux-medium-js"
```

```
nx-cloud start-ci-run --distribute-on="4 my-linux-large-js"
```

```
nx-cloud start-ci-run --distribute-on="4 my-linux-large-rust"
```

## Validating Launch Templates

{% callout type="note" title="Commit before Validation" %}
Before Nx Cloud can validate your custom templates, you must first commit any changes to these templates to your source control repository. Running the validation command from a CI is the recommended approach.
{% /callout %}
After creating your custom launch template, it's recommended to validate it. This ensures that all necessary fields
within the launch template and all respective inputs within each step are appropriately defined.

To do this, run the `nx-cloud validate` command, with the path to the launch template:

```shell
nx-cloud validate --workflow-file=./.nx/workflows/agents.yaml
```

## Pass Environment Variables

If you need to send environment variables to agents, you can use the [--with-env-vars](/ci/reference/nx-cloud-cli#withenvvars-nx-agents-only) flag on the `nx-cloud start-ci-run` command. You can pass a specific list of environment variables like this:

```
nx-cloud start-ci-run --distribute-on="8 linux-medium-js" --with-env-vars="VAR1,VAR2"
```

## Pass Values Between Steps

If you need to pass a value from one step to another step, such as assigning the value to an existing or new environment variable. You can write to the `NX_CLOUD_ENV` environment file.

Commonly used for redefining the `PATH` or setting options for tooling.

```yaml {% fileName="./nx/workflows/agents.yaml" %}
launch-templates:
  my-template-name:
    init-steps:
      - name: Set PATH
        script: echo "PATH=$HOME/.cargo/bin:$PATH" >> $NX_CLOUD_ENV
      - name: Check PATH
        script: |
          # now contains $HOME/.cargo/bin
          echo $PATH 
          # can invoke cargo directly because it's in the PATH now. 
          cargo --version
```

## Private NPM Registry

If your project consumes packages from a private registry, you'll have to set up an authentication step in a custom launch template and authenticate like you normally would, usually this is via a `.npmrc` or `.yarnrc` file. You can pass the auth token from your main agent, so it's available to the agent machines.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  my-linux-medium-js:
    resource-class: 'docker_linux_amd64/medium'
    image: 'ubuntu22.04-node20.11-v9'
    init-steps:
      - name: Checkout
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/checkout/main.yaml'
      - name: Auth to Registry
        script: |
          # create .npmrc with @myorg scoped packages pointing to GH npm registry
          echo "@myorg:registry=https://npm.pkg.github.com" >> .npmrc
          echo "//npm.pkg.github.com/:_authToken=${SOME_AUTH_TOKEN}" >> .npmrc
      - name: Install Node Modules
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-node-modules/main.yaml'
```

Pass `SOME_AUTH_TOKEN` via `--with-env-vars`

```
# this assumes SOME_AUTH_TOKEN is already defined on the main agent
nx-cloud start-ci-run --distribute-on="5 my-linux-medium-js" --with-env-vars="SOME_AUTH_TOKEN"
```

## Custom Node Version

Nx Agents come with node LTS installed. If you want to use a different version, you can add a step to install the desired node version.

{% tabs %}
{% tab label="Pre-Built Step" %}

Nx Cloud provides a [pre-built step to install a custom node version](https://github.com/nrwl/nx-cloud-workflows/tree/main/workflow-steps/install-node) within your workflow. This step is available as of `v4` of the workflow steps and requires the minimum image version to be `ubuntu22.04-node20.11-v9`.

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  node-21:
    resource-class: 'docker_linux_amd64/medium'
    # note the image version of v9,
    # earlier versions of the base image will not work
    image: 'ubuntu22.04-node20.11-v9'
    init-steps:
      - name: Checkout
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/checkout/main.yaml'
      - name: Install Node
        # note the step is only released as of v4 of the workflow steps
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-node/main.yaml'
        inputs:
          # can omit value if a '.nvmrc' file is within the root of the repo
          node_version: '21'
```

{% /tab %}
{% tab label="Manual Installation" %}

Here is a simplified launch template manually installing [nvm](https://github.com/nvm-sh/nvm) to manage different node version.
Feel free to use your preferred tool, other popular options are [volta](https://volta.sh/) or [fnm](https://github.com/Schniz/fnm).
The steps follow the general pattern of:

1. install tool
1. install node with tool
1. persist any environment variable changes for future steps

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  node-21:
    resource-class: 'docker_linux_amd64/medium'
    image: 'ubuntu22.04-node20.11-v9'
    init-steps:
      - name: Checkout
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/checkout/main.yaml'
      - name: Install nvm
        script: |
          # run nvm install script
          curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
          # source the updated profile to get the nvm command available
          source ~/.profile
          # install the needed version of node via nvm
          nvm install 21.7.3
          # echo the current path (which now includes the nvm-provided version of node) to NX_CLOUD_ENV
          echo "PATH=$PATH" >> $NX_CLOUD_ENV
      - name: Print node version
        # confirm that the node version has changed
        script: node -v
      - name: Install Node Modules
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-node-modules/main.yaml'
      # Continue setup steps as needed
```

{% /tab %}
{% /tabs %}

## Specific Package Manager Version

Nx Agents have [corepack enabled](https://nodejs.org/api/corepack.html#corepack) by default, allowing you to define the yarn or pnpm version via the `package.json`.

```json {% fileName="package.json" %}
{
  "packageManager": "yarn@4.1.1"
}
```

{% callout type="note" title="Supported Package Managers" %}
Currently, corepack [only supports yarn or pnpm](https://nodejs.org/api/corepack.html#supported-package-managers) as package managers. If you need to use a specific npm version, you will need to create a custom launch template and install the specific npm version, i.e. `npm install -g npm@<version>`
{%/callout %}

## Installing Packages

You can use `apt` to install popular linux packages. This is helpful in streamlining setting up various toolchains needed for your workspace.

For example, you can install the [GitHub CLI](https://cli.github.com/) on the agents if needed.

```yaml {% fileName="./nx/workflows/agents.yaml" %}
launch-templates:
  my-linux-medium-js:
    resource-class: 'docker_linux_amd64/medium'
    image: 'ubuntu22.04-node20.11-v9'
    init-steps:
      - name: Install Extras
        script: |
          sudo apt install gh unzip zip -y
```

{% callout type="note" title="Installing without apt" %}
If you're trying to install a package that isn't available on `apt`, check that packages install steps for Debian base linux. Usually there are a handful of installation scripts that can be used [similar to `nvm`](#custom-node-version)
{% /callout %}

## AWS CLI

First, define the environment variables on your main agent, where you call [`nx-cloud start-ci-run`](/ci/reference/nx-cloud-cli#npx-nxcloud-startcirun). Pass the same environment variables to your agents via the [`--with-env-vars` flag](/ci/reference/nx-cloud-cli#withenvvars-nx-agents-only).

Minimally the `AWS_REGION` (or `AWS_DEFAULT_REGION`), `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` environment variables are required.

{% callout type="check" title="OIDC Provider" %}
If using an [OIDC provider](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html), e.g. the [AWS GitHub Action recommended setup](https://github.com/aws-actions/configure-aws-credentials?tab=readme-ov-file#using-this-action), then the environment variables are automatically configured for you after authentication to AWS. Since the credentials created for with OIDC provider flow are temporary, you'll need to pass the `AWS_SESSION_TOKEN` environment variable to your agents.

{% /callout %}

{% tabs %}
{% tab label="Pre-Built Step" %}

Using the pre-built step simplifies and provides debugging checks to make sure the AWS CLI is properly authenticated to AWS before continuing. The step is recommended for most use cases.

```yaml {% fileName="./nx/workflows/agents.yaml"  highlightLines=["6-8"]%}
launch-templates:
  my-linux-medium-js:
    resource-class: 'docker_linux_amd64/medium'
    image: 'ubuntu22.04-node20.11-v9'
    init-steps:
      - name: Install AWS CLI
        uses: 'nrwl/nx-cloud-workflows/v5/workflow-steps/install-aws-cli/main.yaml'
        # no additional inputs required, as all configuration is via environment variables via --with-env-vars
```

{% /tab %}
{% tab label="Manual Installation" %}

Manual installation follows [installing the AWS CLI using the official directions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). In order to decompress the installation archive, you'll need to install the `unzip` package in your step.
Manual installation is helpful if a custom installation setup is required.
It is helpful to run `aws sts get-caller-identity` command to make sure you're properly authenticated to AWS before proceeding

```yaml {% fileName="./nx/workflows/agents.yaml" highlightLines=["6-20"] %}
launch-templates:
  my-linux-medium-js:
    resource-class: 'docker_linux_amd64/medium'
    image: 'ubuntu22.04-node20.11-v9'
    init-steps:
      # step assumes you've passed all required AWS_* environment variables from the main agent via --with-env-vars
      - name: Install AWS CLI
        script: |
          # unzip is required to unzip the AWS CLI installer
          sudo apt install gh unzip -y
          curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
          unzip awscliv2.zip
          # run installer, default location is already in the PATH
          # if installing in a custom location, 
          # then update the $PATH like `PATH=$PATH:[extra-path-items] >> $NX_CLOUD_ENV`
          sudo ./aws/install
          # print AWS CLI version to verify command is avaiable
          aws --version
          # verify credentials to AWS is working
          aws sts get-caller-identity
```

{% /tab %}
{% /tabs %}

## Dynamic Changesets

NxCloud can calculate how big your pull request is based on how many projects in your workspace it affects. You can then configure Nx Agents to dynamically use a different number of agents based on your changeset size.

Here we define a `small`, `medium` and `large` distribution strategy:

```yaml {% fileName=".nx/workflows/dynamic-changesets.yaml" %}
distribute-on:
  small-changeset: 3 linux-medium-js
  medium-changeset: 8 linux-medium-js
  large-changeset: 12 linux-medium-js
```

Then you can pass the path to the file to the `--distribute-on` parameter.

```
nx-cloud start-ci-run --distribute-on=".nx/workflows/dynamic-changesets.yaml"
```

## Debugging

You can add steps to your template which print information about your workspace, toolchains, or any other needs.
Below are some common steps people use for debugging such as running nx commands, printing file contents and/or listing directory contents.

{% callout type="caution" title="Environment Variables" %}
Exercise caution when printing out environment variables, they will be shown in plain text.
{% /callout %}

```yaml {% fileName=".nx/workflows/agents.yaml" %}
launch-templates:
  my-linux-medium-js:
    resource-class: 'docker_linux_amd64/medium'
    image: 'ubuntu22.04-node20.11-v9'
    env:
      # enable verbose logging for all steps
      NX_VERBOSE_LOGGING: true
    init-steps:
      - name: 'Debug: Print Nx Report'
        script: |
          nx report
      - name: 'Debug: List Directory Contents'
        script: |
          echo $HOME
          ls -la $HOME
          output_dir=$HOME/dist
          # if output directory exists list it's contents
          if [ -d output_dir ]; then
            ls -la $output_dir
          else
            echo "$output_dir does not exist"
          fi
      - name: 'Debug: Show File Contents'
        script: |
          cat $HOME/.profile
      - name: 'Debug: Check For Checkout Files'
        script: |
          git diff
      - name: 'Debug: Print Versions'
        script: |
          # note if you use yarn and try to run pnpm, corepack might throw an error at you
          # saying you're using the wrong package manager, in that case just remove the usage of pnpm
          echo "Versions:"
          echo "Node: $(node -v)"
          echo "NPM: $(npm -v)"
          echo "Yarn: $(yarn -v)"
          echo "PNPM: $(pnpm -v)"
          echo "Golang: $(go version)"
          echo "Java: $(javac --version)"
          # add any other toolchain you want
      - name: 'Debug: Print env'
        script: |
          # !!! DO NOT RUN THIS IF YOU HAVE PASSWORD/ACCESS TOKENS IN YOUR ENV VARS !!!
          # this will print your env as plain text values to the terminal
          env  
          # This is a safer approach to prevent leaking tokens/passwords
          echo "SOME_VALUE: $SOME_VALUE"
```
