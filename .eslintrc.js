module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  plugins: ["prettier", "@typescript-eslint"],
  extends: [
    "google",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "module",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "object-curly-spacing": ["error", "always"],
    camelcase: ["error", { properties: "always" }],
    "no-console": "warn",
    "no-debugger": "error",
    indent: ["off", "tab"],
    "linebreak-style": ["off", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "quote-props": ["error", "as-needed"],
    "require-await": "error",
    "valid-jsdoc": "off",
    "max-len": ["error", { code: 80 }],
    "new-cap": ["off"],
  },
};
