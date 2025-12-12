# API 加固与同步性能优化

**日期**: 2025-12-12

## 概述

对 API 服务进行稳定性/安全性/性能的针对性升级：统一捕获异步异常、优化同步批量写入、补齐参数校验，并强化 JWT 密钥配置策略。

## 变更内容

### 稳定性

- 新增 `apps/api/src/middleware/asyncHandler.ts`，用于将 `async` 路由异常转交给 `errorHandler`。
- `apps/api/src/routes/auth.ts` / `apps/api/src/routes/sync.ts` / `apps/api/src/routes/user.ts` / `apps/api/src/routes/backup.ts` 逐步引入 `asyncHandler`。

### 性能

- `POST /api/sync/records` 改为：一次性查询现存记录时间戳 + `bulkWrite` 批量写入，减少 N 次数据库往返。

### 安全

- 新增 `apps/api/src/config/jwt.ts`：集中管理 JWT 相关配置。
- `apps/api/src/services/auth.ts` 改为从配置模块读取 JWT 密钥与过期时间，并在缺失密钥时抛出 `JWT_SECRET_NOT_CONFIGURED`（避免生产环境误用弱默认值）。

### 工程化

- `apps/api/tsconfig.json` 增加 `paths`，便于在 monorepo 中解析 `@moodflow/types` / `@moodflow/core` 源码（开发期类型检查）。

## 兼容性说明

- 如在生产环境运行 API，请确保配置 `.env` 中的 `JWT_SECRET` 与 `JWT_REFRESH_SECRET`。
