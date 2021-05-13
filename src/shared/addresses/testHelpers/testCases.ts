import { AddressToken, AtomicAddressToken, CleanedAddressAst } from "../types";

export const testCases: Array<{
  rawAddresses: string[];
  expectedAtomicTokens?: AtomicAddressToken[];
  expectedTokens?: AddressToken[];
  expectedCleanedAddressAst?: CleanedAddressAst;
  expectedCleanedAddress?: string;
  expectedStandardizedAddress?: string | null;
  expectedNormalizedAddress?: string;
}> = [
  {
    rawAddresses: [""],
    expectedAtomicTokens: [],
    expectedTokens: [],
  },
  {
    rawAddresses: [
      "(,58,ПЕНЗЕНСКИЙ Р-Н, ,Засечное С.,МАЛ.ШКОЛЬНЫЙ \"ПРОЕЗД'_10А/42,,)",
    ],
    expectedCleanedAddress:
      "58, ПЕНЗЕНСКИЙ РАЙОН, ЗАСЕЧНОЕ СЕЛО, МАЛЫЙ ШКОЛЬНЫЙ ПРОЕЗД 10А/42",
    expectedAtomicTokens: [
      ["bracket", "("],
      ["comma", ","],
      ["numberSequence", "58"],
      ["comma", ","],
      ["letterSequence", "пензенский"],
      ["spacing", " "],
      ["letterSequence", "р"],
      ["dash", "-"],
      ["letterSequence", "н"],
      ["comma", ","],
      ["spacing", " "],
      ["comma", ","],
      ["letterSequence", "засечное"],
      ["spacing", " "],
      ["letterSequence", "с"],
      ["period", "."],
      ["comma", ","],
      ["letterSequence", "мал"],
      ["period", "."],
      ["letterSequence", "школьный"],
      ["spacing", " "],
      ["quote", '"'],
      ["letterSequence", "проезд"],
      ["quote", "'"],
      ["spacing", "_"],
      ["numberSequence", "10"],
      ["letterSequence", "а"],
      ["slash", "/"],
      ["numberSequence", "42"],
      ["comma", ","],
      ["comma", ","],
      ["bracket", ")"],
    ],
    expectedCleanedAddressAst: {
      nodeType: "cleanedAddress",
      children: [
        {
          nodeType: "word",
          wordType: "cardinalNumber",
          value: "58",
          number: 58,
          ending: "",
        },
        {
          nodeType: "separator",
          separatorType: "comma",
        },
        {
          nodeType: "word",
          wordType: "unclassified",
          value: "пензенский",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "район",
        },
        {
          nodeType: "separator",
          separatorType: "comma",
        },
        {
          nodeType: "word",
          wordType: "unclassified",
          value: "засечное",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "село",
        },
        {
          nodeType: "separator",
          separatorType: "comma",
        },
        {
          nodeType: "word",
          wordType: "designationAdjective",
          value: "малый",
        },
        {
          nodeType: "word",
          wordType: "unclassified",
          value: "школьный",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "проезд",
        },
        {
          nodeType: "word",
          wordType: "cardinalNumber",
          value: "10а",
          number: 10,
          ending: "а",
        },
        {
          nodeType: "separator",
          separatorType: "slash",
        },
        {
          nodeType: "word",
          wordType: "cardinalNumber",
          value: "42",
          number: 42,
          ending: "",
        },
      ],
    },
    expectedStandardizedAddress:
      "область пензенская, засечное, проезд школьный малый, 10а",
    expectedNormalizedAddress:
      "область пензенская, засечное, проезд школьный малый, 10а",
  },

  {
    rawAddresses: [",,Пенз обл., 1я  ул.А.С Пушкина-тестова. д.4,корп№5000"],
    expectedCleanedAddress:
      "ПЕНЗ ОБЛАСТЬ, 1-Я УЛИЦА А. С. ПУШКИНА-ТЕСТОВА ДОМ 4, КОРПУС 5000",
    expectedTokens: [
      ["comma", ","],
      ["comma", ","],
      ["letterSequence", "пенз"],
      ["spacing", " "],
      ["protoWord", "обл."],
      ["comma", ","],
      ["spacing", " "],
      ["protoWord", "1я"],
      ["spacing", "  "],
      ["protoWord", "ул."],
      ["protoWord", "а."],
      ["letterSequence", "с"],
      ["spacing", " "],
      ["protoWord", "пушкина-тестова."],
      ["spacing", " "],
      ["protoWord", "д."],
      ["numberSequence", "4"],
      ["comma", ","],
      ["letterSequence", "корп"],
      ["numberSign", "№"],
      ["numberSequence", "5000"],
    ],
    expectedCleanedAddressAst: {
      nodeType: "cleanedAddress",
      children: [
        {
          nodeType: "word",
          wordType: "unclassified",
          value: "пенз",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "область",
        },
        {
          nodeType: "separator",
          separatorType: "comma",
        },
        {
          nodeType: "word",
          wordType: "ordinalNumber",
          value: "1-я",
          number: 1,
          ending: "-я",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "улица",
        },
        {
          nodeType: "word",
          wordType: "initial",
          value: "а.",
        },
        {
          nodeType: "word",
          wordType: "initial",
          value: "с.",
        },
        {
          nodeType: "word",
          wordType: "unclassified",
          value: "пушкина-тестова",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "дом",
        },
        {
          nodeType: "word",
          wordType: "cardinalNumber",
          value: "4",
          number: 4,
          ending: "",
        },
        {
          nodeType: "separator",
          separatorType: "comma",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "корпус",
        },
        {
          nodeType: "word",
          wordType: "cardinalNumber",
          value: "5000",
          number: 5000,
          ending: "",
        },
      ],
    },
    expectedStandardizedAddress: null,
    expectedNormalizedAddress:
      "ПЕНЗ ОБЛАСТЬ, 1-Я УЛИЦА А. С. ПУШКИНА-ТЕСТОВА ДОМ 4, КОРПУС 5000",
  },
  {
    rawAddresses: ["(р-н. 1-ый,10 к10 10корп5 10Ж,1корп"],
    expectedCleanedAddress: "РАЙОН 1-Й, 10 КОРПУС 10 10 КОРПУС 5 10Ж, 1 КОРПУС",
    expectedTokens: [
      ["bracket", "("],
      ["protoWord", "р-н."],
      ["spacing", " "],
      ["protoWord", "1-ый"],
      ["comma", ","],
      ["numberSequence", "10"],
      ["spacing", " "],
      ["letterSequence", "к"],
      ["numberSequence", "10"],
      ["spacing", " "],
      ["numberSequence", "10"],
      ["letterSequence", "корп"],
      ["numberSequence", "5"],
      ["spacing", " "],
      ["protoWord", "10ж"],
      ["comma", ","],
      ["protoWord", "1корп"],
    ],
  },
  {
    rawAddresses: ["Такая-то ул - 10-12"],
    expectedCleanedAddress: "ТАКАЯ-ТО УЛИЦА, 10-12",
    expectedTokens: [
      ["protoWord", "такая-то"],
      ["spacing", " "],
      ["letterSequence", "ул"],
      ["spacing", " "],
      ["dash", "-"],
      ["spacing", " "],
      ["numberSequence", "10"],
      ["dash", "-"],
      ["numberSequence", "12"],
    ],
    expectedCleanedAddressAst: {
      nodeType: "cleanedAddress",
      children: [
        {
          nodeType: "word",
          wordType: "unclassified",
          value: "такая-то",
        },
        {
          nodeType: "word",
          wordType: "designation",
          value: "улица",
        },
        {
          nodeType: "separator",
          separatorType: "comma",
        },
        {
          nodeType: "word",
          wordType: "cardinalNumber",
          value: "10",
          number: 10,
          ending: "",
        },
        {
          nodeType: "separator",
          separatorType: "dash",
        },
        {
          nodeType: "word",
          wordType: "cardinalNumber",
          value: "12",
          number: 12,
          ending: "",
        },
      ],
    },
  },
  {
    rawAddresses: ['г.Пенза, с/т«труД" ,10/12,сарай_10а'],
    expectedCleanedAddress: "ГОРОД ПЕНЗА, СНТ ТРУД, 10/12, САРАЙ 10А",
    expectedTokens: [
      ["protoWord", "г."],
      ["letterSequence", "пенза"],
      ["comma", ","],
      ["spacing", " "],
      ["protoWord", "с/т"],
      ["quote", "«"],
      ["letterSequence", "труд"],
      ["quote", '"'],
      ["spacing", " "],
      ["comma", ","],
      ["numberSequence", "10"],
      ["slash", "/"],
      ["numberSequence", "12"],
      ["comma", ","],
      ["letterSequence", "сарай"],
      ["spacing", "_"],
      ["protoWord", "10а"],
    ],
  },
  {
    rawAddresses: [
      "2—й  с\\т Такой—то д42", // m-dashes
      "2–й  с\\т Такой–то д42", // n-dashes
      "2−й  с\\т Такой−то д42", // minuses
    ],
    expectedCleanedAddress: "2-Й СНТ ТАКОЙ-ТО ДОМ 42",
    expectedTokens: [
      ["protoWord", "2-й"], // hyphen
      ["spacing", "  "],
      ["protoWord", "с/т"],
      ["spacing", " "],
      ["protoWord", "такой-то"], // hyphen
      ["spacing", " "],
      ["letterSequence", "д"],
      ["numberSequence", "42"],
    ],
  },
  {
    rawAddresses: [
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ПЕНЗЕНСКИЙ Р-Н, С. ЗАСЕЧНОЕ, УЛ_ОВРАЖНАЯ, ДОМ_17, БЛОК №2, КВ.N3",
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ПЕНЗЕНСКИЙ РАЙОН, СЕЛО ЗАСЕЧНОЕ, УЛИЦА ОВРАЖНАЯ, ДОМ 17, БЛОК 2, КВАРТИРА 3",
  },
  {
    rawAddresses: [
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, Р-Н ПЕНЗЕНСКИЙ, С. ЗАСЕЧНОЕ, УЛ. МЕХАНИЗАТОРОВ - 36, ГАРАЖ114",
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, РАЙОН ПЕНЗЕНСКИЙ, СЕЛО ЗАСЕЧНОЕ, УЛИЦА МЕХАНИЗАТОРОВ, 36, ГАРАЖ 114",
  },
  {
    rawAddresses: [
      'Пензенская обл., г. Пенза, с/т "Заря" на территории совхоза "Заря", уч. 350.',
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ПЕНЗА, СНТ ЗАРЯ НА ТЕРРИТОРИИ СОВХОЗА ЗАРЯ, УЧАСТОК 350",
  },
  {
    rawAddresses: [
      "Пензенская область, г.Пенза, Октябрьский район, пр. Брусничный 6-Й, строен.57",
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ПЕНЗА, ОКТЯБРЬСКИЙ РАЙОН, ПРОЕЗД БРУСНИЧНЫЙ 6-Й, СТРОЕНИЕ 57",
  },
  {
    rawAddresses: [
      "Пензенская обл., Пензенский р-н, с. Засечное, ул. Прибрежная, д..1 Б",
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ПЕНЗЕНСКИЙ РАЙОН, СЕЛО ЗАСЕЧНОЕ, УЛИЦА ПРИБРЕЖНАЯ, ДОМ 1Б",
  },
  {
    rawAddresses: ["ул.Московская/ул.К Маркса, сквер 40 лет Октября"],
    expectedCleanedAddress:
      "УЛИЦА МОСКОВСКАЯ/УЛИЦА К. МАРКСА, СКВЕР 40 ЛЕТ ОКТЯБРЯ",
  },
  {
    rawAddresses: [
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, ПРОСПЕКТ 30-ЛЕТИЯ ПОБЕДЫ, ЗДАНИЕ 43-А",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, ПРОСПЕКТ 30 - ЛЕТИЯ ПОБЕДЫ, ЗДАНИЕ 43А",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, ПРОСПЕКТ 30  -ЛЕТИЯ ПОБЕДЫ, ЗДАНИЕ 43А",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, ПРОСПЕКТ 30-\tЛЕТИЯ ПОБЕДЫ, ЗДАНИЕ 43А",
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, ПРОСПЕКТ 30-ЛЕТИЯ ПОБЕДЫ, ЗДАНИЕ 43А",
    expectedStandardizedAddress:
      "область пензенская, заречный, проспект 30-летия победы, 43а",
  },
  {
    rawAddresses: [
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2Е ТАКОЕ-ТО ШОССЕ ДОМ 10-В",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2-Е ТАКОЕ-ТО ШОССЕ ДОМ 10-В",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2-Е ТАКОЕ-ТО ШОССЕ ДОМ 10 - В",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2-Е ТАКОЕ-ТО ШОССЕ ДОМ 10- В",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2-Е ТАКОЕ-ТО ШОССЕ ДОМ 10 -В",
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2-Е ТАКОЕ-ТО ШОССЕ ДОМ 10В",
    expectedStandardizedAddress:
      "область пензенская, заречный, шоссе такое-то 2-е, 10в",
  },
  {
    rawAddresses: [
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2Е ТАКОЕ-ТО ШОССЕ ДОМ 10-Е",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2-Е ТАКОЕ-ТО ШОССЕ ДОМ 10-Е",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2 -Е ТАКОЕ-ТО ШОССЕ ДОМ 10 - Е",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2 - Е ТАКОЕ-ТО ШОССЕ ДОМ 10- Е",
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2- Е ТАКОЕ-ТО ШОССЕ ДОМ 10 -Е",
    ],
    expectedCleanedAddress:
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ЗАРЕЧНЫЙ, 2-Е ТАКОЕ-ТО ШОССЕ ДОМ 10Е",
    expectedStandardizedAddress:
      "область пензенская, заречный, шоссе такое-то 2-е, 10е",
    expectedNormalizedAddress:
      "область пензенская, заречный, шоссе такое-то 2-е, 10е",
  },
  {
    rawAddresses: ["ул. Максима Горького/ул. Володарского 38/45"],
    expectedCleanedAddress: "УЛИЦА МАКСИМА ГОРЬКОГО/УЛИЦА ВОЛОДАРСКОГО 38/45",
    expectedStandardizedAddress: null,
    expectedNormalizedAddress:
      "УЛИЦА МАКСИМА ГОРЬКОГО/УЛИЦА ВОЛОДАРСКОГО 38/45",
  },
  {
    rawAddresses: [
      "Пензенская область, г. Пенза, ул. Лермонтова, 2 / К. Маркса, 30",
    ],
  },
  {
    rawAddresses: [
      "РОССИЙСКАЯ ФЕДЕРАЦИЯ, ПЕНЗЕНСКАЯ ОБЛАСТЬ, ПЕНЗА ГОРОД, ЖЕЛЕЗНОДОРОЖНЫЙ РАЙОН, ЖИВОПИСНЫЙ ПР-Д, ДОМ 12",
    ],
    expectedNormalizedAddress:
      "область пензенская, пенза, проезд живописный, 12",
  },
  {
    rawAddresses: ["область пензенская, пенза, гск импульс, 2 литер дом"],
  },
  {
    rawAddresses: [
      "ГОРОД ПЕНЗА, СЕЛО ГСК QUOT УРАЛ QUOT, УЛИЦА СТРОИТЕЛЕЙ, ДОМ 17В, 61",
      "г Пенза, п Нефтяник, снт &quot;Гудок&quot; 3 квартал, д. №192а",
    ],
  },
  {
    rawAddresses: ["ГОРОД ЗАРЕЧНЫЙ, УЛИЦА ГАРАЖНЫЙ КООПЕРАТИВ ЭЛЬФ, ГАРАЖ 191"],
  },
  {
    rawAddresses: [
      "УЛИЦА ТЕРНОПОЛЬСКАЯ, ДОМ 7, КОРПУС, ПОДЪЕЗД СЕЛО 3 ПО 8, ПЕНЗА, ПЕНЗЕНСКАЯ ОБЛАСТЬ",
    ],
  },
  {
    rawAddresses: ["УЛИЦА СЕРДОБСКАЯ, ДОМ 2, ЛИТ В, ПЕНЗА, ПЕНЗЕНСКАЯ ОБЛАСТЬ"],
  },
  {
    rawAddresses: [
      "Российская Федерация Пензенская область, Пензенский район, село Засечное, улица Речная, д. 16",
    ],
  },
  {
    rawAddresses: [
      "г Заречный, пересечение ул. Школьной и 2-го Школьного проезда",
    ],
    // expectedNormalizedAddress: "г Заречный, пересечение ул. Школьной и 2-го Школьного проезда"
  },
  {
    rawAddresses: ["область пензенская, заречный, улица ю. п. любовина, 15"],
    // expectedNormalizedAddress: "г Заречный, пересечение ул. Школьной и 2-го Школьного проезда"
  },
  {
    rawAddresses: [
      "Пензенская область, г. Пенза, ул. Бугровка Б., ГСК 12, гараж №290",
    ],
    // expectedNormalizedAddress: "г Заречный, пересечение ул. Школьной и 2-го Школьного проезда"
  },
  {
    rawAddresses: ['Пензенская обл., г. Пенза, СНТ "Засека", участок 34/Ш'],
    // expectedNormalizedAddress: "г Заречный, пересечение ул. Школьной и 2-го Школьного проезда"
  },
  {
    rawAddresses: [
      "ПЕНЗЕНСКАЯ ОБЛАСТЬ, ГОРОД ПЕНЗА, УЛИЦА КУЙБЫШЕВА/КРАСНАЯ, 33А/23",
    ],
    // expectedNormalizedAddress: "г Заречный, пересечение ул. Школьной и 2-го Школьного проезда"
  },
  {
    rawAddresses: ["область пензенская, пенза, улица 8 марта дом 90"],
    expectedNormalizedAddress: "область пензенская, пенза, улица 8 марта, 90",
  },
  {
    rawAddresses: [
      "область тестовая, город тестовск, улица 50 лет октября, 1",
      "область тестовая, тестовск, ул. 50 лет октября 1",
    ],
    expectedNormalizedAddress:
      "область тестовая, тестовск, улица 50 лет октября, 1",
  },
  {
    rawAddresses: ["область тестовая, город тестовск, проезд, 10"],
    expectedStandardizedAddress: null,
    expectedNormalizedAddress: "ОБЛАСТЬ ТЕСТОВАЯ, ГОРОД ТЕСТОВСК, ПРОЕЗД, 10",
  },
  {
    rawAddresses: [
      "область тестовая, тестовск, территория снт «6 соток», участок 42",
      "область тестовая, тестовск, тер. снт 6 соток, уч. 42",
      "область тестовая, тестовск, снт 6 соток, уч. 42",
    ],
    expectedNormalizedAddress: "область тестовая, тестовск, снт 6 соток, 42",
  },
  {
    rawAddresses: ["область пензенская, пенза, проезд второй санитарный, 9а"],
    // expectedNormalizedAddress: "г Заречный, пересечение ул. Школьной и 2-го Школьного проезда"
  },
  {
    rawAddresses: [
      "Российская Федерация, Курганская обл, Шумихинский р-н, Шумиха г. Ленина ул, д. 108",
    ],
    // expectedNormalizedAddress: "область курганская, шумиха, улица ленина, 108"
  },
  {
    rawAddresses: [
      "УЛИЦА НАБЕРЕЖНАЯ РЕКИ МОЙКИ, ДОМ 2А, ПЕНЗА, ПЕНЗЕНСКАЯ ОБЛАСТЬ",
    ],
    expectedNormalizedAddress:
      "область пензенская, пенза, улица набережная реки мойки, 2а",
  },
  {
    rawAddresses: [
      "РОССИЙСКАЯ ФЕДЕРАЦИЯ, ПЕНЗЕНСКАЯ ОБЛАСТЬ, РАЙОН ПЕНЗЕНСКИЙ, СЕЛО ЗАСЕЧНОЕ, УЛИЦА НАБЕРЕЖНАЯ, ДОМ 19",
      "РОССИЙСКАЯ ФЕДЕРАЦИЯ, ПЕНЗЕНСКАЯ ОБЛАСТЬ, РАЙОН ПЕНЗЕНСКИЙ, СЕЛО ЗАСЕЧНОЕ, НАБЕРЕЖНАЯ УЛИЦА , ДОМ 19",
    ],
    expectedNormalizedAddress:
      "область пензенская, засечное, улица набережная, 19",
  },
];
