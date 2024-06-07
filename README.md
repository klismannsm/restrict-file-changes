# Restrict file changes action

Created using GitHub [TypeScript action template](https://github.com/actions/typescript-action).

This action allows you to block pull requests that try to modify the files or folders based on the
provided regular expression.

Syntax:

```yml
- name: Restrict file changes
  uses: klismannsm/restrict-file-changes@v1
  with:
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    regex: src\/important\/.*\.txt
    allowNewFiles: false
    allowRemovedFiles: false
```

Inputs:

- `githubToken`: [**Required**] GitHub Token to authenticate the API;
- `regex`: [**Required**] Regular expression pattern to match the changed files paths from a
           pull request. It must be compatible with JavaScript regular expressions;
  - [Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- `allowAddedFiles`: [**Optional**] Whether to allow new files to be added or not.
  - **Default**: false
- `allowRemovedFiles`: [**Optional**] Whether to allow files to be deleted or not.
  - **Default**: false
- `allowAdditions`: [**Optional**] Whether to allow new content to be added to the files.
  - **Default**: false
- `allowDeletions`: [**Optional**] Whether to allow contents to be removed from the files.
  - **Default**: false

## Events supported

- pull_request

## Development

First install the dependencies:

```sh
npm install
```

Make the needed changes and write tests to verify the implementation.

To run tests:

```sh
npm run test
```

To wrap things up, run:

```sh
npm run all
```
