/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "循環依存は密結合と保守性低下を招くため禁止",
      from: {},
      to: { circular: true },
    },
    {
      name: "not-to-test",
      severity: "error",
      comment: "プロダクションコードからテストコードへの依存を禁止",
      from: {
        pathNot: "(\\.(spec|test)\\.[jt]sx?$)|(/__tests__/)",
      },
      to: {
        path: "(\\.(spec|test)\\.[jt]sx?$)|(/__tests__/)",
      },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment:
        "プロダクションコードから devDependencies への import を禁止 (テスト・Storybook を除く)",
      from: {
        path: "^src",
        pathNot:
          "(\\.(spec|test|stories)\\.[jt]sx?$)|(/__tests__/)|(^src/shared/storybook/)",
      },
      to: {
        dependencyTypes: ["npm-dev"],
        // tw-animate-css などの CSS / 型のみの devDependencies を許可するなら個別に書く
      },
    },

    // FSD レイヤー制約 (app → views → shared)
    {
      name: "fsd-views-no-cross-import",
      severity: "error",
      comment:
        "views スライス同士の cross-import 禁止。共通化するなら shared/ に置く",
      from: { path: "^src/views/([^/]+)/" },
      to: {
        path: "^src/views/([^/]+)/",
        pathNot: "^src/views/$1/",
      },
    },
    {
      name: "fsd-shared-no-upward",
      severity: "error",
      comment:
        "shared/ から views/ や app/ への import 禁止 (FSD: app → views → shared)",
      from: { path: "^src/shared/" },
      to: { path: "^src/(app|views)/|^src/proxy\\.ts$" },
    },
    {
      name: "fsd-views-no-upward",
      severity: "error",
      comment: "views/ から app/ への import 禁止 (FSD: app → views → shared)",
      from: { path: "^src/views/" },
      to: { path: "^src/app/|^src/proxy\\.ts$" },
    },
    {
      name: "fsd-app-views-via-public-api",
      severity: "error",
      comment:
        "views/X の内部ファイルを直接 import しないこと。views/X/index.ts (Public API) 経由で import する",
      from: { path: "^src/(app/|proxy\\.ts$)" },
      to: {
        path: "^src/views/[^/]+/.+",
        pathNot: "^src/views/[^/]+/index\\.(ts|tsx)$",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      mainFields: ["main", "types"],
    },
    exclude: {
      path: "(^src/shared/ui/primitives/)|(^storybook-static/)|(^\\.next/)|(^src/types/.*\\.d\\.ts$)",
    },
    cache: false,
  },
};
