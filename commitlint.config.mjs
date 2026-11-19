/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow long URLs / file paths in commit bodies and footers.
    "body-max-line-length": [1, "always", 120],
    "footer-max-line-length": [0],
  },
};

export default config;
