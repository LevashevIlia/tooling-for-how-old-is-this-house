# Tooling for [how-old-is-this.house](https://how-old-is-this.house/en)

This repository helps assemble a geographic dataset with building infos.
The list of attributes includes construction year, floor count, address, photo, wikipedia URL and so on.
The entire process is handled by the console commands, which collect and mix data from various publicly available sources.
The result is automatically turned into uploadable and printable artifacts.
To run the commands, you need to specify a geographic territory, which is usually a single town or city.

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.en@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Because [how-old-is-this.house](https://how-old-is-this.house/en) focuses on cities in Russia, the instructions below are in Russian.
Although some of the data sources are country-specific, most parts of the repo can be recycled for a global re-use.

👀 [English version via Google Translate](https://translate.google.com/translate?sl=ru&tl=en&u=https://github.com/kachkaev/tooling-for-how-old-is-this-house/blob/main/README.md)

---

## Источники данных

🔢 финальные характеристики здания (цифра означает приоритет)  
⏳ временно используемые вспомогательные данные  
🗑 данные игнорируются из-за редкости или низкого качества

📍 точка (point)  
🟥 контур (polygon / multipolygon)

<!-- prettier-ignore-start -->

| | адрес | архитектор |геометрия |  год | название  | стиль | фото | этажность | 🔗 Викиданные | 🔗 Википедия | 🔗 Минкультуры | 🔗 сайт | 
| :- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|<!-- mingkh     --> **[«МинЖКХ»](https://mingkh.ru)**           | 3️⃣ |    | ⏳ 📍 | 4️⃣ |    |   |   | 2️⃣ |    |
|<!-- mkrf       --> **[Минкультуры](https://opendata.mkrf.ru)** | 2️⃣ |    | ⏳ 📍 | 1️⃣ | 3️⃣ |   | 4️⃣ |   |    |    | 1️⃣ |
|<!-- osm        --> **[ОСМ](https://www.openstreetmap.org)**    | 1️⃣ |    | 1️⃣ 🟥 | 3️⃣ | 2️⃣ |   | 3️⃣ | 1️⃣ | 3️⃣ | 3️⃣ |    | 2️⃣
|<!-- rosreestr  --> **[Росреестр](https://rosreestr.gov.ru)**   | 4️⃣ |    | ⏳ 📍 | 5️⃣ | 🗑 |   |    | 3️⃣ |    
|<!-- wikidata   --> **[Викиданные](https://www.wikidata.org)**  | 🗑 | 1️⃣ | ⏳ 📍 | 🗑 | 1️⃣ | 1️⃣ | 1️⃣ |   | 1️⃣ | 1️⃣ |
|<!-- wikimapia  --> **[Викимапия](https://wikimapia.org)**      | 🗑 |    | ⏳ 🟥 | 6️⃣ | 5️⃣ |   | 5️⃣ |   |    | 🗑 |
|<!-- wikivoyage --> **[Викигид](https://ru.wikivoyage.org)**    | 5️⃣ | 2️⃣ | ⏳ 📍 | 2️⃣ | 4️⃣ | 2️⃣ | 2️⃣ |   | 2️⃣ | 2️⃣ |    | 1️⃣

<!-- prettier-ignore-end -->

## Инструкции

Чтобы создать новую карту возраста домов, вам понадобятся:

- базовое понимание [командной строки](https://ru.wikipedia.org/wiki/Интерфейс_командной_строки) (терминала),
- небольшой опыт работы с [гитом](https://ru.wikipedia.org/wiki/Git) (системой контроля версий),
- поверхностное знакомство с форматами [GeoJSON](https://ru.wikipedia.org/wiki/GeoJSON) и [YAML](https://ru.wikipedia.org/wiki/YAML).

В качестве текстового редактора рекомендуется [VSCode](https://code.visualstudio.com) с расширениями
[DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv),
[Geo Data Viewer](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer),
[Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph),
[Git Lens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens),
[Wikitext](https://marketplace.visualstudio.com/items?itemName=rowewilsonfrederiskholme.wikitext) и
[Yaml](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).
Для визуализации полученных данных подойдёт любая геоинформационная программа (например, [QGIS](https://qgis.org/ru/site/)).

В упоминаемых папках и файлах `/path/to` условно обозначает локальную папку, которую вы выделили под проект.
Например, если на вашем компьютере это `/Users/me/projects/how-old-is-this-house`, то `/path/to/some-folder` в инструкциях означает `/Users/me/projects/how-old-is-this-house/some-folder`.

### Требования к системе

Для запуска команд подойдёт любой относительно современный компьютер с любой операционной системой (Linux, macOS, Windows).
Для обработки территории с населением порядка миллиона человека хватит 2-4 ГБ оперативной памяти и порядка 1 ГБ свободного места на диске.
Скорее всего, бутылочным горлышком будет пропускная способность интернета и ограничения, которые накладывают источники на скорость скачивания данных.

### Настройка команд

Эти шаги достаточно выполнить один раз, даже если вы планируете сбор данных для нескольких территорий.

1.  Убедитесь, что на машине установлены [гит](https://git-scm.com/) (система контроля версий) и [нода](https://nodejs.org/ru/) (среда запуска команд).
    При установке ноды рекомендуется выбрать версию LTS.

    Команды для проверки установки:

    ```sh
    git --version
    ## покажет ≥ 2.30
    
    node --version
    ## покажет ≥ 14.16
    ```

1.  Установите последнюю версию [ярна](https://yarnpkg.com) (менеджера зависимостей):

    ```sh
    npm install --global yarn
    ```

    Команда для проверки установки:

    ```sh
    yarn --version
    ## покажет ≥ 1.22
    ```

1.  [Клонируйте](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) этот репозиторий в папку `/path/to/tooling`.

    Если результат оказался в другой папке, например, `/path/to/tooling-for-how-old-is-this-house` или `/path/to/tooling/tooling-for-how-old-is-this-house`, то папку можно перенести.
    Связь с гитхабом при этом не потеряется.
    В качестве самопроверки убедитесь, что на вашем компьютере существует файл `/path/to/tooling/README.md`.

    Про `/path/to` написано выше.

1.  Откройте терминал, перейдите в папку `/path/to/tooling`:

    ```sh
    cd "/path/to/tooling"
    ```

    Название этой папки должно появиться слева от места ввода команды.

1.  Будучи в папке `/path/to/tooling`, установите зависимые библиотеки:

    ```sh
    yarn install
    ```

    Это займёт пару минут.

1.  Будучи в папке `/path/to/tooling`, создайте пустой файл `.env.local`:

    ```sh
    yarn exe src/commands/ensureDotEnvLocal.ts
    ```

    Этот шаг помогает проверить общую работоспособность команд.
    Если возникла ошибка, следует заново пройтись по инструкции (видимо, что-то пропустили).

### Подготовка данных Минкультуры

Этот раздел можно пропустить, если вы собираетесь работать над уже начатой территорией.
Инструкции достаточно выполнить один раз, даже если вы планируете сбор данных для нескольких городов.

1.  Скачайте список объектов с сайта Министерства культуры РФ:  
    [opendata.mkrf.ru/opendata/7705851331-egrkn](https://opendata.mkrf.ru/opendata/7705851331-egrkn)

    Ссылка на архив — в правом верхнем углу страницы.
    Файл должен быть в формате `jsons` (с `s` на конце).

1.  Разархивируйте скаченный файл и поместить его в папку `/path/to/data/sources/mkrf`.
    Название файла желательно не менять.

    > 🚩 **Пользователям macOS и Ubuntu**  
    > Встроенная программа для распаковки архивов отрезает у файла хвост.
    > Чтобы этого избежать, откройте папку со скаченным архивом в терминале и распакуйте его командой `unzip`:
    >
    > ```sh
    > unzip data-50-structure-6.jsons.zip -d .
    > ```

1.  Откройте файл `/path/to/tooling/.env.local` как текстовый и задайте переменную `MKRF_JSONS_DUMP_FILE_PATH`.
    Она указывает путь к скаченному файлу.
    Файл `.env.local` станет выглядеть примерно так:

    ```ini
    MKRF_JSONS_DUMP_FILE_PATH=../data/sources/mkrf/data-50-structure-6.jsons
    ```

    В пути к файлу может быть другая цифра вместо `50`.
    Она означает версию данных.

1.  Будучи в папке `/path/to/tooling`, проверьте выполнение предыдущих шагов:

    ```sh
    yarn exe src/commands/2-sources/mkrf/0-checkJsonsDump.ts
    ```

### Обработка выбранной территории

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Команды в этом репозитории подходят для обработки любой части РФ.
Рекомендуется ограничиваться компактной территорией, например, одной городской агломерацией.
Из-за особенностей процесса получения данных, попытка за раз охватить большую, но при этом малонаселённую территорию, будет неэффективной.

Созданные в рамках этого проекта данные желательно хранить в гит-репозитории.
Это позволяет отслеживать изменения в файлах, делать их резервные копии и работать над территориями совместно.
Репозиторий с данными и репозиторий с кодом команд хранятся отдельно друг от друга.
Данные разных территорий хранятся в независимых друг от друга гит-ветках.

#### Подготовка территории

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-territory@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Перед выполнением шагов в этом разделе вам надо получить доступ к непубличному репозиторию с сырыми данными.
Для этого свяжитесь с автором команд или администраторами [how-old-is-this.house](https://how-old-is-this.house).
Для вашей территории создадут гит-ветку и откроют доступ к репозиторию.
Вы должны быть зарегистрированным пользователем на гитхабе и сообщить свой ник.

После получения доступа:

1.  Создайте локальную папку `/path/to/data/territories`.

1.  Клонируйте соответствующую ветку репозитория с данными в папку `/path/to/data/territories/TERRITORY_NAME`.

    `TERRITORY_NAME` — это название города или части субъекта РФ (например, `pnz-penza` или `mo-saransk`).
    Название папки соответствует названию ветки репозитория (`territories/TERRITORY_NAME`).

1.  Откройте файл `/path/to/tooling/.env.local` как текстовый и укажите путь к выбранной территории.
    Это делается добавлением такой строчки:

    ```ini
    TERRITORY_DATA_DIR_PATH=../data/territories/TERRITORY_NAME
    ```

    Часть `TERRITORY_NAME` надо заменить на реальное название папки.

1.  Если территория новая (то есть ещё не начата кем-то другим), заполните файл `/path/to/data/territories/TERRITORY_NAME/territory-config.yml`.
    Шаблон этого файла уже будет создан до вас.
    Внутри — комментарии с подсказками.

1.  Если территория новая, постройте её границу согласно настройкам в `territory-config.yml` → `extent`:

    ```sh
    yarn exe src/commands/1-buildTerritoryExtent.ts
    ```

    Эта команда создаст файл `/path/to/data/territories/TERRITORY_NAME/territory-extent.geojson`.

    Вместо запуска команды вы можете задать границу территории самостоятельно.
    Для этого надо самостоятельно сохранить любой объект `Polygon` в файл `territory-extent.geojson`.

    Желательно подбирать границы территории так, чтобы они повторяли контуры кадастровых кварталов.
    Это повысит эффективность работы с АПИ Росреестра.

1.  Закоммитьте и запушьте изменения в файлах `territory-config.yml` и `territory-extent.yml` при помощи гита.

    Этот шаг упростит дальнейшую работу над территорий и обесечит вас резервной копией.

#### Получение исходных данных

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-sources@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Все нижеперечисленные команды выполняются из папки `/path/to/tooling`.
Перед их запуском важно выполнить инструкции в предыдущих разделах.

Команды выполняются по очереди сверху вниз.
Если у вас возникает проблема с одним из источников, вы можете по-прежнему запускать команды, которые не упоминают этот источник.
Например, если что-то пошло не так с Росреестром, достаточно начать игнорировать все последующие команды `*/rosreestr/*` и можно пройти весь процесс до конца.
Финальный набор данных будет неполным, но это легко исправить потом — достаточно перезапустить команды.

Если вы совместно работаете над одной территорией, то вам можно пропустить некоторые шаги в этом разделе.
Какие именно — зависит от того, что уже успели сделать до вас.

После запуска команд важно не забывать проверять статус локального гит-репозитория с данными: `/path/to/data/territories/TERRITORY_NAME`.

- Полученные исходные данные отображаются как изменения в репозитории.
  Эти файлы важно коммитить и пушить.

- Промежуточные и итоговые наборы данных дешевле перегенерировать локально, чем хранить в репозитории.
  Такие файлы будут автоматически добавлены в `/path/to/data/territories/TERRITORY_NAME/.gitignore`.

Потратив пару лишних минут на гит после запуска очередной команды, вы можете легко сэкономить себе несколько часов.
Гиту даёт возможность откатить данные до предыдущей версии, если что-то пошло не так.
Такая защита позволяет проводить любые эксперименты без страха что-то испортить или удалить.

##### [«МинЖКХ»](https://dom.mingkh.ru)

1.  Скачайте списки зданий на страницах, которые перечислены в файле `territory-config.yml`:

    ```sh
    yarn exe src/commands/2-sources/mingkh/1-fetchHouseLists.ts
    ```

1.  Скачайте и обработайте данные по зданиями:

    ```sh
    yarn exe src/commands/2-sources/mingkh/2-fetchRawHouseInfos.ts
    yarn exe src/commands/2-sources/mingkh/3-parseRawHouseInfos.ts
    ```

1.  ![][опционально]  
    Создайте временный файл для анализа промежуточного результата:

    ```sh
    yarn exe src/commands/2-sources/mingkh/4-previewHouseInfos.ts
    ```

##### [Минкультуры](https://opendata.mkrf.ru)

1.  Извлеките данные для вашей территории из скаченного ранее дампа:

    ```sh
    yarn exe src/commands/2-sources/mkrf/1-extractObjectsFromJsonsDump.ts
    ```

##### [ОСМ](https://www.openstreetmap.org)

1.  Скачайте контуры зданий и административные границы:

    ```sh
    yarn exe src/commands/2-sources/osm/1-fetchBuildings.ts
    yarn exe src/commands/2-sources/osm/2-fetchBoundariesForRegions.ts
    yarn exe src/commands/2-sources/osm/3-fetchBoundariesForSettlements.ts
    ```

1.  ![][опционально]  
    Скачайте контуры водных объектов и дорог (они понадобятся только для визуализации):

    ```sh
    yarn exe src/commands/2-sources/osm/4-fetchRailways.ts
    yarn exe src/commands/2-sources/osm/5-fetchRoads.ts
    yarn exe src/commands/2-sources/osm/6-fetchWaterObjects.ts
    ```

##### [Росреестр](https://pkk.rosreestr.ru)

1.  Скачайте геопривязанные ОКС (объекты капитального строительства) и земельные участки:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/1-fetchTilesWithCcos.ts
    yarn exe src/commands/2-sources/rosreestr/2-fetchTilesWithLots.ts
    ```

1.  ![][опционально]  
    Создайте временные файлы для анализа промежуточного результата:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/3-previewTileData.ts
    ```

1.  Создайте файлы-страницы для хранения деталей объектов:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/4-generateInitialObjectInfoPages.ts
    ```

1.  Скачайте детали объектов из АПИ `fir_object`:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/5-fetchObjectInfosFromFirApi.ts
    ```

    Эта команда поддерживает многозадачность.
    Вы можете открыть до десяти терминалов и запустить её в каждом окне, чтобы ускорить процесс.

1.  Скачайте детали объектов из АПИ ПКК, чтобы закрыть оставшиеся пробелы:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/6-fetchObjectInfosFromPkkApi.ts
    ```

    Эта команда не поддерживает многозадачность.
    Запуск слишком большого числа запросов к серверу приводит к блокировке айпи-адреса.

1.  Расширьте список кадастровых номеров, если это необходимо.

    Созданные ранее файлы-страницы заканчиваются несколькими десятками пустых кадастровых номеров.
    После опроса АПИ-сервера некоторые кварталы могут заполниться данными «под завязку».
    Это значит, что есть вероятность найти ещё больше объектов, если добавить страниц.

    ```sh
    yarn exe src/commands/2-sources/rosreestr/7-addExtraObjectInfoPages.ts
    ```

    Если новые страницы добавились, следует перезапустить команды `5-fetchObjectInfosFromFirApi` и `6-fetchObjectInfosFromPkkApi.ts`.

    Вероятно, процесс добавления и простукивания страниц придётся повторять несколько раз.
    Если очередной запуск команды `7-addExtraObjectInfoPages` не добавил ни одной страницы, данные Росреестра можно считать собранными.

    ***

    Списки кадастровых номеров иногда содержат пустоты длиной в несколько сотен объектов.
    Они возникают при сносе многоквартирных домов.
    Если за такими пустотами следуют только объекты без координат, то расширение и простукивание диапазонов кадастровых номеров не даёт «дотянуться» до некоторых данных.

    Вероятность такой ситуации крайне мала; вы узнаете о ней только после смешивания и визуализации всех данных.
    Проблема даст о себе знать большим количеством зданий без года постройки в одном из районов.

    Если вы нашли кадастровые номера, до которых команды «не дотягиваются», то вы можете вручную указать их в файле `territory-config.yml`:

    ```yml
    sources:
      # ...
      rosreestr:
        handpickedCnsForPageInfos:
          - ××:××:×××××××:×××
          - ××:××:×××××××:×××
    ```

    На каждый проблемный квартал достаточно ввести только один кадастровый номер (максимальный из найденных вручную).
    После обновления файла `territory-config.yml` надо перезапустить команду `4-generateInitialObjectInfoPages` и все последующие, которые связаны с Росреестром, геокодами и смешиванием слоёв.

##### [Викиданные](https://www.wikidata.org)

1.  Скачайте элементы внутри территории:

    ```sh
    yarn exe src/commands/2-sources/wikidata/1-fetchItems.ts
    ```

##### [Викимапия](https://wikimapia.org)

1.  Скачайте контуры объектов:

    ```sh
    yarn exe src/commands/2-sources/wikimapia/1-fetchTiles.ts
    ```

1.  ![][опционально]  
    Создайте временные файлы для анализа промежуточного результата:

    ```sh
    yarn exe src/commands/2-sources/wikimapia/2-previewTileData.ts
    ```

1.  Скачайте и обработайте детали объектов:

    ```sh
    yarn exe src/commands/2-sources/wikimapia/3-fetchRawObjectInfos.ts
    yarn exe src/commands/2-sources/wikimapia/4-parseRawObjectInfos.ts
    ```

##### [Викигид](https://ru.wikivoyage.org)

1.  Скачайте данные страниц, указанных в файле `territory-config.yml`:

    ```sh
    yarn exe src/commands/2-sources/wikivoyage/1-fetchPages.ts
    ```

#### Создание локального каталога геокодов

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-geocoding-local@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Геокодирование — это процесс связывания адреса объекта и его координат.
В собранных нами данных есть здания с адресом и координатами, а также записи, где координаты отсутствуют.
Собрав каталог геокодов, мы уменьшим количество объектов без координат.

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/geocoding@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Команды для пока ещё неготовых источников следует пропустить.
Их можно запускать в любом порядке.

```sh
yarn exe src/commands/2-sources/mingkh/8-reportGeocodes.ts
yarn exe src/commands/2-sources/mkrf/8-reportGeocodes.ts
yarn exe src/commands/2-sources/osm/8-reportGeocodes.ts
yarn exe src/commands/2-sources/rosreestr/8-reportGeocodes.ts
yarn exe src/commands/2-sources/wikidata/8-reportGeocodes.ts
yarn exe src/commands/2-sources/wikimapia/8-reportGeocodes.ts
yarn exe src/commands/2-sources/wikivoyage/8-reportGeocodes.ts
```

Результат работы команд будет в папке `/path/to/data/territories/TERRITORY_NAME/geocoding`.
Созданные файлы игнорируются гитом, поэтому команды следует выполнять каждый раз после обновления данных из источников.

<!-- TODO: Написать про territory-config.yml → addressHandling -->

#### Заполнение пробелов в локальном каталоге геокодов

![][опционально]

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-geocoding-external@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Сопоставление адресов и географических координат из разных источников существенно улучшает качество смешивания данных.
Тем не менее, координаты некоторых зданий по-прежнему остаются неизвестными.
Для их получения можно воспользоваться сторонним сервисом, в частности [геокодером от Яндекса](https://yandex.ru/dev/maps/geocoder/).
Этот этап улучшает финальный результат, но не является решающим.
Его можно пропустить или выполнить позже.

Полнота данных ОСМ на выбранной территории существенно влияет на количество пробелов в каталоге геокодов.
Чтобы уменьшить зависимость от стороннего геокодера, попробуйте улучшить данные в ОСМ и потом скачать их заново.
Пример такого мини-проекта — [пензенская картовечеринка](https://wiki.openstreetmap.org/wiki/RU:Пенза/встречи).

Чтобы воспользоваться геокодером от Яндекса, вам потребуется ключ для их АПИ.
Его получают на странице [developer.tech.yandex.ru/services](https://developer.tech.yandex.ru/services) (следует выбрать _JavaScript API и HTTP Геокодер_).
Важно, чтобы у вас было разрешение кэшировать ответы сервера, иначе вы будете нарушать лицензионное соглашение.

Ключ от АПИ надо добавить в файл `/path/to/tooling/.env.local`:

```ini
YANDEX_GEOCODER_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

1.  Запустите геокодер и сохраните результат в кэш:

    ```sh
    yarn exe src/commands/2-sources/yandex/1-geocodeAddressesWithoutPosition.ts
    ```

    В зависимости от лимита запросов для вашего ключа, вам может понадобиться несколько дней, чтобы закрыть все пробелы.
    Можно продолжать обработку данных, не дожидаясь полного геокодирования адресов, а потом вернуться к этому шагу.

1.  Добавьте полученные геокоды в каталог:

    ```sh
    yarn exe src/commands/2-sources/yandex/8-reportGeocodes.ts
    ```

    Как и на предыдущем шаге, результат команды `*/8-reportGeocodes.ts` не попадает в гит-репозиторий.
    Значит, эту команду надо выполнить каждый раз при клонировании или обновлении репозитория с данными.

---

Если вы подготавливаете данные итерациями, некоторые геокоды Яндекса могут стать лишними.
Например, это происходит после улучшения данных ОСМ.
Чтобы удалить лишние файлы из кэша, воспользуетесь этой командой:

```sh
yarn exe src/commands/2-sources/yandex/2-deleteCacheEntriesForUnusedAddresses.ts
```

#### Подготовка к смешиванию данных

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-output-layers@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

У нас есть исходные данные из нескольких источников, а также локальный каталог геокодов.
Чтобы склеить источники, нам нужно привести все данные к единому формату, заполнив при этом недостающие геокоды.

Единица смешивания данных — стандартизированный файл (слой).
Для каждого источника создаётся по одному слою.

Команды для пока ещё неготовых источников следует пропустить.
Их можно запускать в любом порядке.

```sh
yarn exe src/commands/2-sources/mingkh/9-extractOutputLayer.ts
yarn exe src/commands/2-sources/mkrf/9-extractOutputLayer.ts
yarn exe src/commands/2-sources/osm/9-extractOutputLayer.ts
yarn exe src/commands/2-sources/rosreestr/9-extractOutputLayer.ts
yarn exe src/commands/2-sources/wikidata/9-extractOutputLayer.ts
yarn exe src/commands/2-sources/wikimapia/9-extractOutputLayer.ts
yarn exe src/commands/2-sources/wikivoyage/9-extractOutputLayer.ts
```

Результатом работы команд станут файлы `/path/to/data/territories/TERRITORY_NAME/sources/*/output-layer.geojson`.
Они игнорируется гитом, потому что их дешевле перегенерировать, чем хранить.
Файлы `output-layer.geojson` следует перегенерировать после изменения исходных данных или обновления каталога геокодов.

<!-- TODO: добавить про territory-config → sources → mkrf → fixedLonLatById -->

#### Смешивание данных

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-mixing@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Этот финальный этап обработки данных комбинирует слои, которые мы получили на предыдущем шаге.

Исходные слои выполняют одну из двух ролей: являются _базой_ (источником геометрии и характеристик) или _заплаткой_ (только источником характеристик).
Роль базового слоя выполняет ОСМ, все остальные источники — заплатки.

1.  Смешайте базовые слои и заплатки:

    ```sh
    yarn exe src/commands/3-mixing/1-mixOutputLayers.ts
    ```

1.  Запустите команду выбора финальных характеристик из нескольких вариантов:

    ```sh
    yarn exe src/commands/3-mixing/2-mixPropertyVariants.ts
    ```

Всё готово! 🎉

#### Просмотр результата

![][опционально]

Результат смешивания данных откроется в любой
геоинформационной программе (например, [QGIS](https://qgis.org/ru/site/)).
Есть возможность отобразить его в браузере.
Для этого надо запустить веб-сервер из папки `/path/to/tooling`:

```sh
yarn dev
```

Команда останется запущенной в терминале до нажатия `ctrl+c`.
Пока веб-сервер работает, черновик постера и гистограмма годов постройки доступны по адресу [localhost:3000](http://localhost:3000).

Размеры, цвета и другие параметры постера задаются в `territory-config.yml` → `poster`.

#### Корректировка результата

![][опционально]

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-manual-layers@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

Запуск команд не требует ручных шагов по обработке данных.
Как следствие, ошибки в источниках неизбежно попадают в итоговый файл.

Чтобы повысить качество и полноту результата, предусмотрена возможность подмешивать локальные данные, которые подготовлены вручную.
Это позволяет добавлять на карту особые объекты (например, мосты) или исправлять ошибки в характеристиках (например, корректировать год постройки).

Как и файлы `/path/to/data/territories/TERRITORY_NAME/sources/*/output-layer.geojson`, ручные слои — это файлы `*.geojson`.
Их помещают в папку `/path/to/data/territories/TERRITORY_NAME/sources/manual`.
Название файла может быть любым (например, `bridges.geojson`), а число таких файлов неограниченно.
Структура содержимого — такая же, как у файлов `output-layer.geojson`.

Данные из папки `manual` имеют приоритет над остальными источниками.
При создании нового файла `*.geojson` важно не забыть указать `"layerRole": "base"` или `"layerRole": "patch"` — иначе этот слой будет проигнорирован.

При ручном создании объекта-заплатки есть специальная возможность перечислить данные, которые следует проигнорировать при смешивании.
Например, в слое Минкультуры может быть снесённое здание, на месте которого построено новое, с уже правильными данными в Росреестре.
Чтобы исключить данные по снесённому зданию из результата, мы создаём файл `/path/to/data/territories/TERRITORY_NAME/sources/manual/patches.geojson` (`"layerRole": "patch"`).
В него добавляем точку с координатами внутри контура проблемного здания:

```json
{
  "type": "FeatureCollection",
  "layerRole": "patch",
  "privateNote": "Слой с заплатками (в этом месте может быть любая заметка)",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [12.345678, 12.345678]
      },
      "properties": {
        "dataToOmit": "mkrf",
        "privateNote": "ул. Тестовая 42 отмечен как памятник архитектуры, а это уже небоскрёб"
      }
    }
  ]
}
```

Увидев `"dataToOmit": "mkrf"`, команды исключат характеристики здания по версии Минкультуры из финального набора данных.
Чтобы исправить другие случаи неправильного смешивания данных, следует добавить больше объектов `Feature` в этот же файл.

Кроме названия игнорируемого источника, можно указывать идентификатор объекта и конкретной характеристики через разделитель `|`.
Также разрешается перечислять несколько правил через запятую:

```json
"dataToOmit": "mkrf"
"dataToOmit": "mkrf|id12345"
"dataToOmit": "mkrf|id12345|completionTime"
"dataToOmit": "mkrf|*|completionTime"
"dataToOmit": "mkrf|id12345,mingkh|*|completionTime"
```

После обновления файлов `/path/to/data/territories/TERRITORY_NAME/sources/manual/*.geojson`, следует повторить команды в разделе «Смешивание слоёв».

Важно не заниматься ручным редактированием файлов во всех папках `/path/to/data/territories/TERRITORY_NAME/sources/*`, кроме `manual`.
Исправления в других подпапках сотрутся при обновлении данных.

Неточности в ОСМ проще всего исправлять на сайте [osm.org](https://www.openstreetmap.org), а потом заново скачивать улучшенные данные.
Инструкции для участия в проекте вы найдёте на [wiki.osm.org](https://wiki.openstreetmap.org/wiki/RU:Заглавная_страница).
При добавлении любых данных в базу ОСМ важно пользоваться только разрешёнными источниками.
Копировать содержимое других карт запрещено — сомнительные правки будут удалены участниками сообщества. [См. FAQ](https://wiki.openstreetmap.org/wiki/RU:FAQ).

#### Публикация результата

![][опционально]

<!--markdownlint-disable no-inline-html -->
<center><img width="846" src="docs/assets/tooling-diagram.stage-results@2x.drawio.png" /></center>
<!--markdownlint-enable no-inline-html -->

> 🚧 Эта часть документации не завершена

<!-- Инструкции в этом разделе предназначены для тех, кто закончил подготовку данных и готов к их публикации на сайте [how-old-is-this.house](https://how-old-is-this.house). -->

<!-- Перед выгрузкой данных на сайт [how-old-is-this.house](https://how-old-is-this.house) запустите эту команду: -->
<!-- Она создаст копию результата в подходящем для сайта формате. -->

##### Черновик постера

```sh
yarn exe src/commands/4-results/generatePoster.ts
```

##### Гистограмма годов постройки

```sh
yarn exe src/commands/4-results/generateHistogram.ts
```

##### Слои для загрузки на Геосемантику

```sh
yarn exe src/commands/4-results/generateGeosemanticaLayers.ts
```

##### Стили слоёв

```sh
yarn exe src/commands/4-results/generateGeosemanticaLayerStyles.ts
```

##### Цветовая легенда

```sh
yarn exe src/commands/4-results/generateGeosemanticaColorLegend.ts
```

[опционально]: https://img.shields.io/badge/-опционально-white.svg
