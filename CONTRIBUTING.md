# DeFi Wallet Contributing Guide

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
The components/screens will always have up to date english presentation of what you see on the app.
This allows developers with all levels of experience, to CMD/CTRL + SHIFT + F and find responsible code easily.

2. **Improved translation experience:**
Translator will be translating from the english text instead of 'keys' which is suboptimal.
When the english text change context or meaning, it will always require all translations to be updated.

## Testing Guides

### Test file should be co-located

By not using `__tests__` directory, this keep the imports (`../button`) clean and makes the file structure flat.
Making it easier for discovery of test and keep the related concerns together. 

```txt
src/
├─ components/
│  ├─ button.tsx
│  └─ button.test.tsx
```

### All features must be tested with accepted coverage. (Target 100%)

Each package or functionality must be accompanied by full coverage testing.

## Developing Guides

### Tailwind RN

Tailwind should be used to write all styles, and styles file should be avoided.
If the component gets too complex, you should separate it into its own component.

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
