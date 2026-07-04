module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist/", "build/", "coverage/", "node_modules/"],
  overrides: [
    {
      files: ["apps/api/**/*.ts"],
      env: {
        es2022: true,
        node: true
      }
    },
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      env: {
        browser: true,
        es2022: true
      }
    }
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ]
  }
};
