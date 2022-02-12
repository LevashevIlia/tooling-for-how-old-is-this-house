module.exports = {
  extends: [
    "@kachkaev/eslint-config-react",
    "@kachkaev/eslint-config-react/extra-type-checking",
    "plugin:@next/next/recommended",
  ],
  rules: {
    "import/no-unresolved": "off", // https://github.com/import-js/eslint-plugin-import/issues/2132
  },
  overrides: [
    {
      files: ["src/shared/**"],
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            cases: {
              camelCase: true,
              pascalCase: true,
            },
          },
        ],
      },
    },
    {
      files: ["src/commands/**"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
  ],
};
