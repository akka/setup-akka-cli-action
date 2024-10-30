* Create a [new release](https://github.com/akka/setup-akka-cli-action/releases/new) with a new tag and the title equal to the tag
* Choose the version judiciously, as making the version a minor number bump will allow existing users to be upgraded seamlessly. A major number bump will force them to update their action. Follow this [instruction](https://docs.github.com/en/actions/creating-actions/about-custom-actions#using-release-management-for-actions)
* Move major version tag `v1` to the latest release, e.g. `v1` to `v1.0.2`.
* When bumping the major version (e.g. from `v1` to `v2`), update the following:
  * [README.md](README.md)
  * [Akka Docs](https://doc.akka.io/snapshots/akka-documentation/operations/integrating-cicd/github-actions.html)