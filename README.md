# Content filler для Figma

Проект содержит только плагин для Figma. Код и манифест находятся в папке `figma/`.

- [Инструкция и функциональность](figma/README.md)
- [Манифест для импорта в Figma Desktop](figma/manifest.json)
- [Готовый архив](figma/content-filler-figma.zip)

Изображения загружаются с `https://lbbot.shop`.

## Разработка

Из корня проекта:

```sh
npm --prefix figma ci
npm --prefix figma run check
npm --prefix figma run build
npm --prefix figma test
```
