/**
 * Conventional Commits configuration for JSK META LLC website.
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["web", "content", "style", "ci", "docs", "legal", "assets", "deps", "release"],
    ],
    "header-max-length": [2, "always", 92],
    "body-max-line-length": [1, "always", 120],
  },
};
