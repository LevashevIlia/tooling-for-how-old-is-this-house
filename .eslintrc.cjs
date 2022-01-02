// eslint-disable-next-line no-undef
module.exports = {
  extends: [
    "plugin:unicorn/recommended",
    "@kachkaev/eslint-config-react",
    // "@kachkaev/eslint-config-base/extra-type-checking", // TODO: release and replace
    "plugin:@next/next/recommended",
  ],
  rules: {
    "import/no-unresolved": "off", // https://github.com/import-js/eslint-plugin-import/issues/2132
    "unicorn/prevent-abbreviations": "off",
  },
  overrides: [
    {
      files: ["src/{commands,shared,ui}/**"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["*.ts{x,}"],
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "@typescript-eslint/no-confusing-void-expression": "error",
        "@typescript-eslint/no-unnecessary-condition": "error",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
      },
    },
  ],
};
