module.exports = {
  extends: ["@kachkaev/eslint-config-react"],
  rules: {
    "import/no-default-export": "error",
    "import/no-unresolved": "off", // https://github.com/import-js/eslint-plugin-import/issues/2132
    "@typescript-eslint/naming-convention": [
      "error",
      // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md
      {
        selector: "class",
        format: ["StrictPascalCase"],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: ["variableLike"],
        format: ["strictCamelCase", "StrictPascalCase"],
        filter: {
          regex: "^(_|.*[XYZ][A-Z].*)$",
          match: false,
        },
      },
      {
        selector: ["memberLike"],
        leadingUnderscore: "allow",
        filter: {
          regex: "^(__ANT_.*|_|.*[XYZ][A-Z].*|__html|.*(--|__).*)$",
          match: false,
        },
        format: ["strictCamelCase", "StrictPascalCase", "UPPER_CASE"],
      },
    ],
  },
  overrides: [
    {
      files: ["*.cjs"],
      env: { node: true },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: ["*.config.js", "src/pages/**"],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      files: ["src/scripts/**"],
      rules: {
        "import/no-default-export": "off",
        "no-restricted-syntax": [
          "error",
          ...require("@kachkaev/eslint-config-base").rules[
            "no-restricted-syntax"
          ].slice(1),
          {
            selector: "ExportNamedDeclaration,ExportDefaultDeclaration",
            message:
              "A script cannot have exports. Reusable logic should be stored outside /scripts/.",
          },
        ],
      },
    },
  ],
};
