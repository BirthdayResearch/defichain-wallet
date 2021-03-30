# `.idea`

If you are reading this and wondering why `.idea/` files are commited to GitHub. Well...

### `.idea/dictionaries/*`

> IntelliJ IDEA helps you make sure that all your source code, including variable names, textual strings, comments, literals, and commit messages, is spelt correctly. For this purpose, IntelliJ IDEA provides a dedicated Typo inspection which is enabled by default.

1. Spellcheck everything, code are no expections
2. Adopt the principles of fixing all red/orange/yellow/wavy errors.
3. Treat all text as code, because they are and can introduces bugs. `client.call('generatetoaddress')`
   vs `client.call('generatetoadress')`
4. Lastly, share that same improved developer experience with all IntelliJ IDEA users.

### `.idea/codeStyles/*`

Although ts-standard --fix the code styles, the provided code style is provided to match ts-standard defaults.

### `.idea/*.xml`

For convenience and better developer onboarding experience as suggested by IntelliJ and @fuxingloh.
