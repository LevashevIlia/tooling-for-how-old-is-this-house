# Tooling for adding new cities to [how-old-is-this.house](https://how-old-is-this.house/en)

🚧🚧🚧 **WORK IN PROGRESS** 🚧🚧🚧

This repository contains commands for assembling a dataset with building ages for a specified area.
The commands collect data from various publicly available sources, process it and combine together into a single map layer.

Because [how-old-is-this.house](https://how-old-is-this.house/en) focuses on cities in Russia, the instructions below are in Russian.
Although some of the data sources are country-specific, parts of the repo can still be recycled for a global re-use.

👀 [English version on Google Translate](https://translate.google.com/translate?sl=ru&tl=en&u=https://github.com/kachkaev/tooling-for-how-old-is-this-house/blob/main/README.md)

---

## Источники данных

🔢 данные, попадающие в финальный набор (цифра означает приоритет)  
⏳ временно используемые вспомогательные данные  
🗑 данные игнорируются из-за редкости или низкого качества

📍 точка (point)  
🟥 контур (polygon / multipolygon)

<!-- prettier-ignore-start -->

| | адрес | геометрия | год постройки | название | 🔗 Википедия | фотография |
| :- | :-: | :-: | :-: | :-: | :-: | :-: |
| **[МинЖКХ](https://mingkh.ru)**           | 3️⃣ | ⏳ 📍 | 2️⃣ |
| **[Минкульт](https://opendata.mkrf.ru)**  | 1️⃣ | ⏳ 📍 | 1️⃣ | 1️⃣ |   | 1️⃣ |
| **[ОСМ](https://www.openstreetmap.org)**  | 2️⃣ | 1️⃣ 🟥 | 4️⃣ | 2️⃣ | 1️⃣ |
| **[Росреестр](https://rosreestr.gov.ru)** | 4️⃣ | ⏳ 📍 | 3️⃣ |
| **[Викимапия](https://wikimapia.org)**    | 🗑 | ⏳ 🟥 |   | 🗑 | 🗑 | 2️⃣ |

<!-- prettier-ignore-end -->

## Инструкции

Чтобы выполнить приведённые ниже шаги, вам понадобится базовое понимание [командной строки](https://ru.wikipedia.org/wiki/Интерфейс_командной_строки) (терминала) и небольшой опыт работы с [гитом](https://ru.wikipedia.org/wiki/Git) (системой контроля версий).
Также пригодится поверхностное знание форматов [GeoJSON](https://ru.wikipedia.org/wiki/GeoJSON) и [YAML](https://ru.wikipedia.org/wiki/YAML).

В качестве текстового редактора рекомендуется [VSCode](https://code.visualstudio.com) с плагинами
[DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv),
[Geo Data Viewer](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer),
[Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph),
[Git Lens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) и
[Yaml](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).
Для визуализации полученных данных подойдёт любая геоинформационная программа, например, [QGIS](https://qgis.org/ru/site/).

В упоминаемых папках и файлах `/path/to` условно обозначает локальную папку, выделенную под проект.
Например, если на вашем компьютере это `/Users/me/projects/how-old-is-this-house`, то `/path/to/some-folder` означает `/Users/me/projects/how-old-is-this-house/some-folder`.

### Требования к системе

Для запуска команд подойдёт любой относительно современный компьютер с любой операционной системой (Linux, macOS, Windows).
Для обработки территории с населением порядка миллиона человека хватит 2-4 ГБ оперативной памяти и в районе 200-400 МБ свободного места на диске.
Скорее всего, бутылочным горлышком будет пропускная способность интернета и ограничения, которые накладывают источники на скорость скачивания данных.

### Настройка команд

Эти шаги достаточно выполнить один раз, даже если вы планируете сбор данных для нескольких территорий.

1.  Убедиться, что на машине установлены [гит](https://git-scm.com/) (система контроля версий) и [нода](https://nodejs.org/ru/) (среда запуска наших команд).
    При установке ноды рекомендуется выбрать версию LTS.

    Команды для проверки установки:

    ```sh
    git --version
    ## покажет ≥ 2.30
    
    node --version
    ## покажет ≥ 14.16
    ```

1.  Установить последнюю версию [ярна](<[Yarn](https://yarnpkg.com)>) (менеджера зависимостей):

    ```sh
    npm install --global yarn
    ```

    Команда для проверки установки:

    ```sh
    yarn --version
    ## покажет ≥ 1.22
    ```

1.  [Клонировать](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) этот репозиторий в папку `/path/to/tooling`.

1.  Открыть терминал, перейти в папку `/path/to/tooling`:

    ```sh
    cd "/path/to/tooling"
    ```

    Название этой папки должно появиться слева от места ввода команды.

1.  Будучи в папке `/path/to/tooling`, установить зависимые библиотеки:

    ```sh
    yarn install
    ```

    Это займёт пару минут.

1.  Будучи в папке `/path/to/tooling`, создать пустой файл `.env.local`:

    ```sh
    yarn exe src/commands/ensureDotEnvLocal.ts
    ```

    Если возникает ошибка, повторить предыдущие шаги (видимо, что-то пропустили).

### Подготовка данных Минкульта

Эти шаги достаточно выполнить один раз, даже если вы планируете сбор данных для нескольких территорий.

1.  Скачать список объектов с сайта Министерства Культуры:  
    <https://opendata.mkrf.ru/opendata/7705851331-egrkn>

    Ссылка на архив — в правом верхнем углу страницы.
    Файл должен быть в формате `jsons` (с `s` на конце).

1.  Разархивировать скаченный файл и поместить его в папку `/path/to/data/sources/mkrf`.
    Название файла желательно не менять.

1.  Открыть файл `/path/to/tooling/.env.local` как текстовый и указать переменную `MKRF_JSONS_DUMP_FILE_PATH`.
    Её смысл — указывать путь к скаченному файлу.
    Вероятно, файл `.env.local` станет выглядеть так:

    ```env
    MKRF_JSONS_DUMP_FILE_PATH=../data/sources/mkrf/data-50-structure-6.jsons
    ```

    В пути к файлу может быть другая цифра вместо `50`.
    Она означает версию данных.

1.  Будучи в папке `/path/to/tooling`, проверить выполнение предыдущих шагов:

    ```sh
    yarn exe src/commands/2-sources/mkrf/0-checkJsonsDump.ts
    ```

### Подготовка территории

Команды в этом репозитории могут запускаться для любой части РФ.
Рекомендуется ограничиваться компактной территорией: например, одной городской агломерацией.
Из-за особенностей процесса получения данных, попытка за раз охватить большую, но при этом малонаселённую территорию, будет неэффективной.

Созданные в рамках этого проекта данные желательно хранить в гит-репозитории.
Это позволяет отслеживать изменения в файлах, делать их резервные копии и совместно работать над территориями.
Репозиторий с данными и репозиторий с командами развиваются и хранятся отдельно друг от друга.

Перед выполнением шагов в этом разделе вам надо получить доступ к репозиторию с данными.
Для вас будет создана новая гит-ветка из специальной ветки-шаблона `territories/_blank`.
После этого надо:

1.  Создать локальную папку `/path/to/data/territories`, если она пока не существует.

1.  Клонировать соответствующую ветку репозитория с данными в папку `/path/to/data/territories/TERRITORY_NAME`.

    `TERRITORY_NAME` — это название города или части субъекта РФ (например, `penza` или `penza_oblast_kuznetsk`).
    Название папки соответствует названию ветки репозитория (`territories/TERRITORY_NAME`).

1.  Открыть файл `/path/to/tooling/.env.local` как текстовый и указать путь к выбранной территории.
    Это делается добавлением такой строчки:

    ```dotenv
    TERRITORY_DATA_DIR_PATH=../data/territories/TERRITORY_NAME
    ```

    Часть `TERRITORY_NAME` надо заменить на реальное название папки.

1.  Если территория новая (то есть ещё не начата кем-то другим), заполнить файл `/path/to/data/territories/TERRITORY_NAME/territory-config.yml`.
    Этот ямл уже должен быть создан гитом.
    Внутри — комментарии с подсказками.

1.  Если территория новая, построить её границу:

    ```sh
    yarn exe src/commands/1-buildTerritoryExtent.ts
    ```

    Эта команда возьмёт настройки из `territory-config.yml` → `extent` и создаст файл `/path/to/data/territories/TERRITORY_NAME/territory-extent.geojson`.

    Вместо использования команды, вы можете задать границу территории самостоятельно, сохранив любой полигон в файл `territory-extent.geojson`.

    Из-за особенностей работы с АПИ Росреестра желательно выбирать границы территории так, чтобы они повторяли контуры кадастровых кварталов.

1.  Закоммитить и запушить изменения в файлах `territory-config.yml` и `territory-extent.yml` при помощи гита.
    Этот шаг упростит дальнейшую работу над территорий и избавит вас от необходимости делать резервные копии данных.

### Получение и обработка данных для территории

Все нижеперечисленные команды выполняются из папки `/path/to/tooling`.
Перед их запуском важно выполнить инструкции в предыдущих разделах.

Команды выполняются по очереди сверху вниз.
Если у вас возникает проблема с одним из источников, можете продолжать выполнение любых команд, которые этот источник не упоминают.
Например, если что-то пошло не так с Росреестром, достаточно начать игнорировать все последующие команды `src/commands/2-sources/rosreestr/*`, и можно продолжать.

Если вы совместно работаете с кем-то ещё над одной территорией, то вам надо можно будет пропустить некоторые команды.
Какие именно — зависит от того, что уже успели сделать до вас.

После запуска команд важно не забывать проверять статус локального гит-репозитория с данными: `/path/to/data/territories/TERRITORY_NAME`.

- Скаченные и обработанные сырые данные отображаются как изменения в репозитории.
  Эти файлы важно коммитить и пушить.

- Промежуточные наборы данных дешевле перегенерировать локально, чем хранить в репозитории.
  Такие файлы перечислены в `/path/to/data/territories/TERRITORY_NAME/.gitignore`.
  Благодаря этой настройке, вы не увидите изменений в гит-репозитории после запуска определённых команд.

Потратив пару лишних минут на гит после запуска очередной команды, вы можете сэкономить себе несколько часов.
Гит позволяет откатить папку с данными к предыдущей версии, если что-то пошло не так (например, вы запустили команду, которая обнулила созданные ранее данные).

Вот все шаги:

1.  **Скачать и обработать данные с МинЖКХ**

    ```sh
    yarn exe src/commands/2-sources/mingkh/1-fetchHouseLists.ts
    yarn exe src/commands/2-sources/mingkh/2-fetchRawHouseInfos.ts
    yarn exe src/commands/2-sources/mingkh/3-parseRawHouseInfos.ts
    ```

    Создание файла для анализа результата (опционально):

    ```sh
    yarn exe src/commands/2-sources/mingkh/4-previewHouseInfos.ts
    ```

1.  **Извлечь данные из скаченного ранее дампа Минкульта**

    ```sh
    yarn exe src/commands/2-sources/mkrf/1-extractObjectsFromJsonsDump.ts
    ```

1.  **Скачать данные с ОСМ**

    Контуры зданий и административные границы:

    ```sh
    yarn exe src/commands/2-sources/osm/1-fetchBuildings.ts
    yarn exe src/commands/2-sources/osm/2-fetchBoundaries.ts
    ```

    Контуры водных объектов и дорог (опционально, понадобится только для визуализации):

    ```sh
    yarn exe src/commands/2-sources/osm/3-fetchWaterObjects.ts
    yarn exe src/commands/2-sources/osm/4-fetchRoads.ts
    ```

1.  **Скачать данные с Росреестра**

    ОКС (объекты капитального строительства) и участки с геопривязкой:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/1-fetchTilesWithCcos.ts
    yarn exe src/commands/2-sources/rosreestr/2-fetchTilesWithLots.ts
    ```

    Создание файла для анализа результата (опционально):

    ```sh
    yarn exe src/commands/2-sources/rosreestr/3-previewTileData.ts
    ```

    Подготовка к скачиванию деталей объектов:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/4-generateObjectInfoPages.ts
    ```

    Скачивание деталей объектов из АПИ `fir_object`:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/5-fetchObjectInfosFromFirApi.ts
    ```

    > ↑ Эта команда поддерживает многозадачность.
    > Вы можете открыть до десяти терминалов и запустить её, чтобы ускорить процесс.

    Скачивание деталей объектов АПИ ПКК, чтобы закрыть оставшиеся пробелы:

    ```sh
    yarn exe src/commands/2-sources/rosreestr/6-fetchObjectInfosFromPkkApi.ts
    ```

    > ↑ Эта команда не поддерживает многозадачность.
    > Запуск слишком большого числа запросов приводит к блокировке айпи-адреса.

    <!--
    Скачать данные с Викидаты:
    ```sh
    yarn exe src/commands/2-sources/wikidata/1-fetchRawRecords.ts
    ```
    Эта команда пока не доделана, потому что для Пензы было мало мало данных.
    -->

1.  **Скачать данные с Викимапии**

    Контуры объектов:

    ```sh
    yarn exe src/commands/2-sources/wikimapia/1-fetchTiles.ts
    ```

    Создание файла для анализа результата (опционально):

    ```sh
    yarn exe src/commands/2-sources/wikimapia/2-previewTileData.ts
    ```

    Детали объектов:

    ```sh
    yarn exe src/commands/2-sources/wikimapia/3-fetchRawObjectInfos.ts
    yarn exe src/commands/2-sources/wikimapia/4-parseRawObjectInfos.ts
    ```

1.  **Создать локальную библиотеку геокодов**

    Геокодирование — процесс связывания адреса объекта и его координат.
    У нас есть ряд источников, в некоторых из которых известен и адрес, и координаты зданий, а в некоторых других — только адрес.
    Собрав локальную библиотеку геокодов, мы уменьшим количество объектов без координат.

    ```sh
    yarn exe src/commands/2-sources/mingkh/8-reportGeocodes.ts
    yarn exe src/commands/2-sources/mkrf/8-reportGeocodes.ts
    yarn exe src/commands/2-sources/osm/8-reportGeocodes.ts
    yarn exe src/commands/2-sources/rosreestr/8-reportGeocodes.ts
    yarn exe src/commands/2-sources/wikimapia/8-reportGeocodes.ts
    ```

    Результат работы команд будет в папке `/path/to/data/territories/TERRITORY_NAME/geocoding`.
    Созданные файлы игнорируются гитом, поэтому команды следует выполнять каждый раз после клонирования или обновления репозитория с данными.

1.  **Заполнить пробелы в библиотеке геокодов при помощи Яндекса**

    Полнота данных ОСМ на выбранной территории существенно влияет на количество пробелов в локальной библиотеке геокодов.
    Чтобы уменьшить зависимость от внешнего геокодера, попробуйте улучшить данные в ОСМ и потом скачать их заново.
    См. [пензенскую картовечеринку](https://wiki.openstreetmap.org/wiki/RU:Пенза/встречи) в качестве примера такого подхода.

    Чтобы воспользоваться геокодером от Яндекса, вам потребуется ключ для их АПИ.
    Его получают на странице [developer.tech.yandex.ru/services](https://developer.tech.yandex.ru/services): следует выбрать _JavaScript API и HTTP Геокодер_.
    Важно, чтобы у вас было разрешение кэшировать результат запросов, иначе вы будете нарушать лицензионное соглашение.

    Ключ от АПИ надо добавить в файл `/path/to/tooling/.env.local`:

    ```dotenv
    YANDEX_GEOCODER_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    ```

    Обращение к геокодеру:

    ```sh
    yarn exe src/commands/2-sources/yandex/1-geocodeAddressesWithoutPosition.ts
    ```

    > ↑ В зависимости от лимита запросов для вашего ключа, вам может понадобиться несколько дней, чтобы закрыть все пробелы.
    > Можно продолжать, не дожидаясь полного геокодирования адресов, а потом вернуться к этому шагу.

    После сбора геокодов из Яндекса следует добавить их в локальную библиотеку:

    ```sh
    yarn exe src/commands/2-sources/yandex/8-reportGeocodes.ts
    ```

    Как и на предыдущем шаге, результат команды `*/8-reportGeocodes.ts` не попадает в гит-репозиторий.
    Значит, эту команду надо выполнить в том числе если `*/yandex/1-geocodeAddressesWithoutPosition.ts` запускали до вас на другой машине.

1.  **Подготовить слои для склейки**

    ```sh
    yarn exe src/commands/2-sources/mingkh/9-extractOutputLayer.ts
    yarn exe src/commands/2-sources/mkrf/9-extractOutтак putLayer.ts
    yarn exe src/commands/2-sources/osm/9-extractOutputLayer.ts
    yarn exe src/commands/2-sources/rosreestr/9-extractOutputLayer.ts
    yarn exe src/commands/2-sources/wikimapia/9-extractOutputLayer.ts
    ```

    Эти команды создадут файлы `/path/to/data/territories/TERRITORY_NAME/sources/*/output-layer.geojson`.
    Некоторые из них обращаются к локальной библиотеке геокодов, созданной ранее.
    Результат команд игнорируется гитом, потому что его дешевле перегенерировать, чем хранить.

1.  **Склеить слои**

    Этот финальный этап обработки данных смешивает файлы, которые мы получили на предыдущем шаге.

    Исходные слои выполняют одну из двух ролей: являются _базой_ (источником геометрии и характеристик) или _заплаткой_ (только источником характеристик).
    Роль базового слоя выполняет ОСМ, все остальные источники — заплатки.

    Смешивание базовых слоёв и заплаток:

    ```sh
    yarn exe src/commands/3-mixOutputLayers.ts
    ```

    Выбор характеристик объектов из нескольких вариантов:

    ```sh
    yarn exe src/commands/4-mixPropertyVariants.ts
    ```

    <!--
    1.  **Подготовить данные к выгрузке**
    Эта команда подгоняет склеенный набор данных под формат сайта <https://how-old-is-this.house>.
    ```sh
    yarn exe src/commands/5-prepareUpload.ts
    ```
    -->

### Просмотр черновика постера

Результат склейки слоёв доступен в виде веб-страницы.
Чтобы её открыть, надо запустить локальный веб-сервер, будучи в папке `/path/to/tooling`:

```sh
yarn dev
```

Эта команда остаётся запущенной в терминале до нажатия `ctrl+c`.
Пока веб-сервер работает, черновик постера доступен в браузере по адресу [localhost:3000/poster](http://localhost:3000/poster).

Чтобы сгенерировать изображение с постером, надо открыть второй терминал, перейти в папку `/path/to/tooling` и запустить команду:

```sh
yarn exe src/commands/9-makePoster.ts
```

Для успешной генерации файла, важно, чтобы в первом терминале команда `yarn dev` продолжала быть запущенной.
Путь к черновику постера будет написан в выводе команды.

Цвета домиков настраиваются в `/path/to/tooling/src/shared/completionDates.ts`.
Веб-страница автоматически обновляется при сохранении этого файла.
При изменениях в данных, страницу надо обновить вручную.

### Корректировка результата

Запуск команд в предыдущем разделе инструкции не требует ручных шагов по обработке данных.
Как следствие, результат их работы полностью зависит от внешних источников.
Ошибки в источниках неизбежно попадают в итоговый набор данных.

Чтобы повысить качество и полноту результата, предусмотрена возможность подмешивать данные, созданные вручную.
Это позволяет добавлять на карту особые объекты (например, мосты) или исправлять ошибки в характеристиках (например, корректировать год постройки).

Как и файлы `/path/to/data/territories/TERRITORY_NAME/sources/*/output-layer.geojson`, ручные слои — это файлы `*.geojson`.
Их помещают в папку `/path/to/data/territories/TERRITORY_NAME/sources/manual`.
Название файла может быть любым (например, `bridges.geojson`), чисто таких файлов не ограничено.
Структура содержимого — такая же, как у файлов `output-layer.geojson`.

Объекты из папки `manual` имеют приоритет над остальными источниками.
Важно не забыть указать `"layerRole": "base"` или `"layerRole": "patch"`, иначе ваш файл `*.geojson` будет проигнорирован.

При ручном создании объекта-заплатки есть возможность перечислить данные, которые следует проигнорировать при склейке.
Например, в слое Минкульта может быть дом, который уже снесён, а на этом месте него построен новый, с уже правильными данными в Росреестре.
Чтобы исключить данные по снесённому дому из склейки, мы создаём файл `/path/to/data/territories/TERRITORY_NAME/sources/manual/patches.geojson`.
В этот файл добавляем точку с координатами внутри контура проблемного дома:

```json
{
  "type": "FeatureCollection",
  "layerRole": "patch",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [12.345678, 12.345678]
      },
      "properties": {
        "dataToIgnore": "mkrf",
        "description": "ул. Тестовая 42 отмечен как памятник, а это уже небоскрёб"
      }
    }
  ]
}
```

Благодаря `"dataToIgnore": "mkrf"`, характеристики здания по версии Минкульта будут исключены из финального набора данных.
В дополнении к названию источника, допускается указание идентификатора объекта и конкретной характеристики через разделитель `|`.
Также разрешается указывать несколько правил через запятую:

```json
"dataToIgnore": "mkrf"
"dataToIgnore": "mkrf|id12345"
"dataToIgnore": "mkrf|id12345|completionDates"
"dataToIgnore": "mkrf|*|completionDates"
"dataToIgnore": "mkrf|id12345,mingkh|*|completionDates"
```

После обновления файлов `/path/to/data/territories/TERRITORY_NAME/sources/manual/*.geojson`, следует повторить шаг «Склеить слои» в предыдущем разделе.

Важно не заниматься ручным редактированием файлов во всех папках `/path/to/data/territories/TERRITORY_NAME/sources/*`, кроме `/path/to/data/territories/TERRITORY_NAME/sources/manual`.
Исправления, сделанные в других папках, сотрутся при следующем обновлении данных.

Неточности в ОСМ проще всего исправить на сайте [osm.org](https://www.openstreetmap.org), а потом заново скачать улучшенные данные.
Инструкции для участия в проекте вы найдёте на [wiki.osm.org](https://wiki.openstreetmap.org/wiki/RU:Заглавная_страница).
При добавлении любых данных в ОСМ важно пользоваться только разрешёнными источниками.
Копировать содержимое других карт запрещено — сомнительные правки будут удалены другими участниками сообщества. [См. FAQ](https://wiki.openstreetmap.org/wiki/RU:FAQ).
