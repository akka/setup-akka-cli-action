# Akka CLI for GitHub Actions 

This [JavaScript action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action) for 
GitHub workflows installs and configures the [Akka CLI](https://doc.akka.io/snapshots/akka-documentation/akka-cli/using-cli.html) tool. After running this action, the `akka` 
command is 
available in the workflow. 



## Usage

The action takes two required parameters to authenticate and set the Akka project ID:

* `token`: The Akka authentication token
* `project-id`: The Akka project ID you're using

## Example Workflow

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
        uses: akka/setup-akka-cli-action@v1
        with:
          token: ${{ secrets.AKKA_TOKEN }}
          project-id: ${{ vars.AKKA_PROJECT_ID }}
      - name: List services
        run: akka service list
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

This project is an [incubator](https://doc.akka.io/docs/akka-dependencies/current/support-terminology.html#incubating)

## License

See the [LICENSE](./LICENSE)
