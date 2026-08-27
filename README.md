# Akka CLI for GitHub Actions

This [JavaScript action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action) for 
GitHub workflows installs and configures the [Akka CLI](https://doc.akka.io/akka-cli/using-cli.html) tool. After running this action, the `akka` 
command is 
available in the workflow. 



## Usage

To authenticate, use either a refresh token, or (preferred) OAuth workload identity — these are mutually exclusive:

* `token`: The Akka authentication [refresh token](https://doc.akka.io/operations/integrating-cicd/index.html#create_a_service_token)

or

* `oauth-audience`: The OAuth audience to request from GitHub's OIDC provider, or
* `oauth-provider-organization-id` and `oauth-provider-name`: used together to build the audience as
  `organizations/<oauth-provider-organization-id>/identityproviders/<oauth-provider-name>`

Using OAuth workload identity requires no secrets to be stored in GitHub — GitHub's OIDC provider issues a short-lived
identity token that Akka's identity provider trusts. This requires the workflow to grant `permissions: id-token: write`.

Optional inputs:

* `project-id`: The Akka project ID you're using (mutually exclusive with `project`)
* `project`: The Akka project friendly name you're using (mutually exclusive with `project-id`)
* `api-server-host`: Override the Akka API server host
* `organization`: The Akka organization to configure

## Example Workflow (refresh token)

The below flow shows how to use this action to list all services in your project

```yaml
name: akka

on: 
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Install Akka CLI
        uses: akka/setup-akka-cli-action@v1.0.3
        with:
          token: ${{ secrets.AKKA_TOKEN }}
          project-id: ${{ secrets.AKKA_PROJECT_ID }}
      - name: List services
        run: akka service list
```

## Example Workflow (OAuth workload identity)

The below flow authenticates without any stored secrets, using GitHub's OIDC provider:

```yaml
name: akka

on: 
  push:
    branches: [ main ]

permissions:
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Install Akka CLI
        uses: akka/setup-akka-cli-action@v1.0.3
        with:
          oauth-provider-organization-id: 00000000-0000-0000-0000-000000000000
          oauth-provider-name: github-actions
          project-id: ${{ secrets.AKKA_PROJECT_ID }}
      - name: List services
        run: akka service list
```

## Granting GitHub Actions access to Akka (OAuth workload identity)

Before a workflow can authenticate via OAuth workload identity, you need to (one time, ahead of running any
workflow) tell Akka to trust GitHub as an identity provider, and grant your repository a role. Both steps are done
with the Akka CLI, authenticated as an organization admin — they are not part of the GitHub Actions workflow itself.

### 1. Add GitHub Actions as an identity provider

See [`akka organizations identity-providers add oauth`](https://doc.akka.io/reference/cli/akka-cli/akka_organizations_identity-providers_add_oauth.html)
for full details. GitHub's OIDC tokens include a `repository` claim (e.g. `my-org/my-repo`), which is generally what
you want to grant access based on, so it needs to be mapped — either as the workload identity subject:

```shell
akka organizations identity-providers add oauth github-actions \
  --organization <your-organization> \
  --issuer https://token.actions.githubusercontent.com \
  --subject-claim repository
```

or, if you'd rather keep the default `sub` claim (which also encodes the branch/ref, e.g.
`repo:my-org/my-repo:ref:refs/heads/main`) as the subject, by mapping `repository` as an additional claim instead:

```shell
akka organizations identity-providers add oauth github-actions \
  --organization <your-organization> \
  --issuer https://token.actions.githubusercontent.com \
  --claim-mapping repository=repository
```

`github-actions` here is the identity provider name, used as the `oauth-provider-name` input to this action, and
`<your-organization>` is the `oauth-provider-organization-id` input.

### 2. Grant the repository a role

With the project you want to grant access to selected (e.g. via `akka config set project <project>`, or by having
this action's `AKKA_PROJECT` already set), grant the repository's workload identity a role — usually `developer` —
using [`akka roles add-binding`](https://doc.akka.io/reference/cli/akka-cli/akka_roles_add-binding.html). Use
`--workload-identity-subject` if you mapped `repository` as the subject claim above:

```shell
akka roles add-binding \
  --identity-provider github-actions \
  --identity-provider-org <your-organization> \
  --workload-identity-subject my-org/my-repo \
  --role developer
```

or `--workload-identity-claim` if you mapped it via `--claim-mapping` instead:

```shell
akka roles add-binding \
  --identity-provider github-actions \
  --identity-provider-org <your-organization> \
  --workload-identity-claim repository=my-org/my-repo \
  --role developer
```

## Building and developing

Follow the [instructions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github) to build and push the action.

* run `npm i --target_arch=x64 --target_platform=linux`
* update index.js file with your changes
* run `ncc build index.js`
* commit sources and `dist` folder

## Contributing

We welcome all contributions! [Pull requests](https://github.com/akka/setup-akka-cli-action/pulls) are the preferred way to share your contributions. For major changes, please open [an issue](https://github.com/akka/setup-akka-cli-action/issues) first to discuss what you would like to change.

## Support

This project is an [incubator](https://doc.akka.io/libraries/akka-dependencies/current/support-terminology.html#incubating)

## License

See the [LICENSE](./LICENSE)
