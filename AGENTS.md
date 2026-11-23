# Работа с BANKFLOW

- В `src/` находятся шаблоны, JSON, стили, JS и сборщик. Он создаёт `index.html`, каталог и список ресурсов в `assets/`, комплекты в `exports/` и `sw.js`. Правьте исходники и пересобирайте производные файлы.
- Семь программных дисциплин находятся в `modules/`, физкультура описана в `docs/08-physical-education.md`. Общие CSV и SQL находятся в `data/` и `database/`. Документы для каталога перечислены в `src/build.py`.
- GitHub Pages раздаёт статику. Прогресс хранится в браузере. Для локального учебного API с SQLite запустите `python backend/server.py` на loopback. Не публикуйте API.
- Из корня выполните `python src/build.py`, `node tests/test_js.js`, `node tests/test_sw.js`, `python tests/test_build_integrity.py`. Проверьте `git status --short` и включайте ожидаемые изменения артефактов в тот же коммит.
- Дополнительно запустите `python tests/test_browser.py` и `python tests/test_v11.py`. Требуются Python Playwright, Chromium по пути `/usr/bin/chromium`, доступ браузера к локальным файлам и свободные loopback-порты 8765 и 8766. Тесты сохраняют снимки в `tests/`.
- Используйте синтетические данные. Запрещено добавлять секреты и реальные персональные данные. Не выдавайте демо за сданную лабораторную и не удаляйте учебные материалы ради редизайна.
