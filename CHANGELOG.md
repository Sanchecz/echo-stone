# Changelog

Все заметные изменения проекта документируются в этом файле. Формат следует Keep a Changelog, версия использует Semantic Versioning.

## [1.0.0] - 2026-08-17

### Added

- Процедурный изометрический мир 22×22 с разрушаемыми и устанавливаемыми слоями блоков.
- Добыча пяти ресурсов, четыре строительных материала и три сюжетных рецепта.
- Шесть завершённых глав, три противника, три ядра памяти, финальный выбор и два эпилога.
- Свободный режим после окончания истории и восстановление после поражения.
- Автосохранение с полной валидацией недоверенного JSON.
- Управление клавиатурой, мышью и сенсорным экраном.
- Адаптивный HUD, журнал глав, верстак, помощь, звук и reduced-motion режим.
- SSR metadata, social card, release icons и русская локализация.
- Unit, integration и security regression tests.
- Cloudflare Worker security headers, release runbook и checklist.

### Security

- Запрет внешних script/object/frame/form источников политикой CSP.
- COOP, CORP, `nosniff`, Referrer Policy, Permissions Policy и frame denial.
- Удалены неиспользуемые starter-зависимости и необъявленные persistence surfaces.
- Обновлены Next.js, React RSC и Vite; уязвимые транзитивные sharp, PostCSS, undici, ws, esbuild и image-size закреплены на исправленных версиях.
