# ESLint 基建与 CI 稳定性修复

**日期**: 2025-12-14

## 概述

为仓库补齐根级 ESLint 配置，使 `npm run lint` 可在 Monorepo（apps/*, packages/*）与微信小程序（根级 pages/utils 等）同时运行，并修复阻断 CI 的 ESLint 错误。

## 变更内容

### 工程化

- 新增根目录 `.eslintrc.cjs`
  - 统一配置 TypeScript（`*.ts/*.tsx`）与 JavaScript（`*.js/*.cjs`）的 lint 规则。
  - 为微信小程序环境声明全局变量（`App`/`Page`/`Component`/`wx` 等），避免误报。
  - 对 monorepo 构建产物与常见目录设置 ignore，避免无意义扫描。

- 根目录 `package.json`
  - 新增 `test:integration`：执行 `tests/integration/run_tests.js`（小程序集成测试脚本）。

- CI（`.github/workflows/ci.yml`）
  - 新增 `Integration Test (Miniprogram)` 步骤：执行 `npm run test:integration`。

### 代码修复（保证 lint 不失败）

- `packages/core/src/stats.ts`
  - 修复 `prefer-const` 与 `no-constant-condition` 相关问题。

- `packages/core/tests/storage.test.ts`
  - 修复 `prefer-const`。
  - 修复测试内 mock 的 `StorageAdapter` 与泛型签名不匹配导致的 TypeScript 类型错误，并补齐 `clear()`。

- `apps/web/*`
  - 清理未使用的导入/变量，修复 `tsc -b` 的 `noUnusedLocals` 构建失败（`TS6133`/`TS6196`）。

## 当前状态

- `npm run lint`：可通过（仍存在若干 warnings，后续可逐步消化）。
- `npm run test:integration`：通过。
- `npm run build`：通过。
- 发现 TypeScript 与 `@typescript-eslint` 的版本支持范围存在不一致提示，后续建议对齐工具链版本以消除告警。
