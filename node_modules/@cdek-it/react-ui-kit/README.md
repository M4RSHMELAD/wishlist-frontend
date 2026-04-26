## Как пользоваться

#### Установка
```bash
npm install @cdek-it/react-ui-kit
```

далее в scss своего проекта прописать
```scss
@use '@cdek-it/react-ui-kit/dist/theme-light.css';
```

Для поддержки старых верси браузера, нужны следующие телодвижения
```bash
npm install -D vite-plugin-string-replace
```

Далее в конфиге vite.config.ts
```ts
export default defineConfig({
  // ...
  plugins: [
    //...
    StringReplace([
      {
        search: '@layer primereact {',
        replace: '@media screen {',
      },
    ]),
    //...
  ]
});
```

### Иконки

В дизайне в основном используется https://tabler.io/icons/

Но можно подключать свои, так как с версии `1.1.0` они не идут в пакете

Подключить можно 3 вариантами
1. Иконки как шрифты
2. Иконки как svg
3. Иконки с CDN

### Иконки как шрифты
Начиная с версии `1.1.0` в пакете не будут добавляться иконки `@tabler/icons-webfont`

Чтобы их поставить нужно
```bash
npm install @tabler/icons-webfont
```

далее в scss прописать
```scss
@import "@tabler/icons-webfont/dist/tabler-icons.min.css";
```

*Прочитать внимательно*

При подключении иконок как шрифты у вас будет over 6000 иконок из которых вы будете использовать 1%, но весить все это будет много и грузится тоже долго. А во время загрузки будут квадраты

Поэтому лучше использовать как svg или на cdn

### Иконки как svg 
Подключаются как реакт компоненты, далее в сборке будут только те, которые нужны в проекте

Чтобы их поставить нужно
```bash
npm install @tabler/icons-react
```

далее в scss прописать
```scss
@import "@tabler/icons-webfont/dist/tabler-icons.min.css";
```

если используется vite, обязательно добавить строчку в `vite.config.ts`
```ts
//...
  resolve: {
    alias: {
      //...
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
//...
```

если не добавить, будет оочень долгая сборка в дев режиме https://stackoverflow.com/questions/79194970/tabler-icons-for-react-slowing-down-app-on-initial-load

#### Размеры иконок
Если не используется tailwind, то в scss можно добавить
```scss
@use '@cdek-it/react-ui-kit/dist/utils/icons.scss';
```
тогда можно будет использвать классы из дизайна: вместо **text-2xl** -> **icon-2xl** и тд

Если используется tailwind, то подключение ниже

### Иконки с CDN

Добавляются в проекте в html, актуальность загруженной версии нужно смотреть в фронт-гильдии

```html
<link rel="preconnect" href="https://public-static.cdek.ru" />
<link
  rel="stylesheet"
  href="https://public-static.cdek.ru/common/icons/v3.30.0/tabler-icons.min.css"
/>
```

### Подключение Tailwind

Используем v3
```bash
npm install -D tailwindcss@^3.0.0 postcss autoprefixer
```

Конфиг для темы tailwind.config.js
```ts
/** @type {import('tailwindcss').Config} */
import { colors, screens, iconsPluginCallback } from '@cdek-it/react-ui-kit/dist/tailwind';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors,
    screens,
    extend: {
      ...themeExtend,
    },
  },
  plugins: [
    // для иконок, чтобы можно было использовать icon-2xl, icon-[111px], md:icon-3xl
    plugin(iconsPluginCallback),
  ],
};
```

Конфиг postcss.config.js
```js
export default {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Далее в своем проекте подключаем

```scss
@use '@cdek-it/react-ui-kit/dist/utils/typography.scss';

@tailwind base;
@tailwind utilities;
```

...
