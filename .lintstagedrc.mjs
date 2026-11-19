/** @type {import('lint-staged').Configuration} */
const config = {
  "*.{ts,tsx,mts,mjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{css,json,md,yml,yaml}": ["prettier --write"],
};

export default config;
