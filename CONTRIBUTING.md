# DeFiChain Wallet Contributing Guide

## Translation Guides

Translation matrix should be keyed as such:

en | file location        | text/key | translation
---|----------------------|----------|--------------
zh | screens/ScreenName   | Hello    | 你好
zh | screens/ScreenName   | Bye      | 再见
de | screens/ScreenName   | Bye      | Tschüss

In this matrix, the key will always be the english representation of the text. Hence, the 'key' must be verbose.

The benefits of this design allows:

1. **Improved developer experience:**
   The components/screens will always have up to date english presentation of what you see on the app. This allows
   developers with all levels of experience, to CMD/CTRL + SHIFT + F and find responsible code easily.

2. **Improved translation experience:**
   Translator will be translating from the english text instead of 'keys' which is suboptimal. When the english text
   change context or meaning, it will always require all translations to be updated.

## Testing Guides

Type | Location
---- | ----------------------------------------
ui   | [app/screens/**.test.ts](mobile-app/app/screens)
api  | [app/hooks/**.test.ts](mobile-app/app/hooks)
e2e  | [cypress/integration/functional](mobile-app/cypress/integration/functional)

### Element should have `testID` attributes

Elements should have `testID` attribute to be used as unique selector. This attribute is decoupled to any styling or
behavior changes.

### Test file should be co-located

By not using `__tests__` directory, this keep the imports (`../button`) clean and makes the file structure flat. Making
it easier for discovery of test and keep the related concerns together.

```txt
app/
├─ components/
│  ├─ button.tsx
│  └─ button.test.tsx
```

### All features must be tested with accepted coverage. (Target 100%)

Each package or functionality must be accompanied by full coverage testing.

Due to Javascript type coercion, all test assertions must use strict equality checking.

```diff
-   expect(1).toBe('1')
-   expect(1).toEqual('1')
+   expect(1).toStrictEqual(1)
```

## Developing Guides

### Tailwind RN

Tailwind should be used to write all styles, and styles file should be avoided. If the component gets too complex, you
should separate it into its own component.

```tsx
<View style={tailwind('flex-1 items-center justify-center')}>
  <Button title='Click' onPress={() => setCount(count + 2)} />
  <Text testID='count'>
    Count: {count}
  </Text>
</View>
```

### TODO comments

TODO comments should usually include the author's github username in parentheses. Example:

```ts
// TODO(fuxingloh): Add tests.
```

### Code of conduct

Please follow the guidelines outlined at https://github.com/DeFiCh/.github/blob/main/CODE_OF_CONDUCT.md

### Explicit over implicit

Each package, feature, code and decision should be explicit and well documented over implicitly guessing.

### TypeScript

TypeScript must be used for all code written in this project.

### `constants.ts` not allowed

It's an anti-pattern for scaling code, it gives a false impression of separation of concern. All it does is create a
mass of code concentration within project that were better separated.

> An analogy for this problem is file organization in projects. Many of us have come to agree that organizing files by
> file type (e.g. splitting everything into html, js and css folders) don't really scale. The code related to a feature
> will be forced to be split between three folders, just for a false impression of "separation of concerns". The key
> here is that "concerns" is not defined by file type. Instead, most of us opt to organize files by feature or
> responsibility. https://github.com/vuejs/rfcs/issues/55#issuecomment-504875870

### Minimize dependencies (target zero)

### Do not depend on external code. (never if possible)

### Use underscores or periods, not dashes in filenames.

Example: Use `foo.bar.ts` instead of `foo-bar.ts`.

### Top level functions should not use arrow syntax.
