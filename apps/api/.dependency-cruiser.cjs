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
        "プロダクションコードから devDependencies への import を禁止 (テストを除く)",
      from: {
        path: "^src",
        pathNot: "(\\.(spec|test)\\.[jt]sx?$)|(/__tests__/)",
      },
      to: {
        dependencyTypes: ["npm-dev"],
      },
    },

    // Prisma 隔離: route.ts は service.ts 経由でのみ DB アクセスする
    // (PrismaClient の named import 制約は oxlint の no-restricted-imports で別途担保)
    {
      name: "route-no-prisma",
      severity: "error",
      comment:
        "route handler から prisma クライアントを直接 import しない。service.ts を経由すること",
      from: { path: "^src/features/[^/]+/route\\.ts$" },
      to: { path: "^src/shared/lib/prisma\\.ts$" },
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
    cache: false,
  },
};
