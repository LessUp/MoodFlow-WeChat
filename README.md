# MoodFlow · 心情日历（WeChat Mini Program）

一个优雅的开源微信小程序：用表情快速记录每日心情与备注，支持本地存储与可选云同步，并内置统计与检索能力。

## 特性
- 日历视图
  - 月份切换：左右滑动、顶部月份选择器、上一月/下一月
  - 今天快捷键、当月格子着色、备注小圆点标记
  - 点按选心情、长按进详情
- 记录详情：心情选择、备注编辑、一键清除
- 设置中心：
  - 周起始日、表情集合、颜色映射
  - 主题（浅色/深色），全局适配含导航栏
  - 数据导出/导入（JSON）、清除
  - 云同步（环境 ID、立即同步、本地变更自动同步）
- 统计面板：日/周/月趋势折线与占比环图（ECharts，自动回退 Canvas）、连续天数、分布统计、空状态
- 记录检索：关键词、日期范围、表情过滤，时间线结果可跳转详情

## 技术栈
- 微信小程序（WXML/WXSS/JS）、云开发（可选）
- 本地存储：`wx.setStorageSync`
- 同步策略：本地/云按 `ts`（毫秒）“后写优先”合并
- 图表：ECharts（有库即启用，无库回退到 Canvas）

## 目录结构（节选）
- pages/
  - calendar/ 日历
  - detail/ 详情
  - settings/ 设置
  - stats/ 统计
  - search/ 检索
  - privacy/ 隐私
- utils/ `date.js` `storage.js` `settings.js` `colors.js` `cloud.js` `sync.js`
- cloudfunctions/ `login/`
- ec-canvas/ ECharts 组件与说明
- changelog/

## 快速开始
1. 使用“微信开发者工具”导入本项目目录。
2. 本地预览无需 AppID；若需云同步，请使用真实 AppID 并开通云开发。
3. 运行后进入“设置”页进行个性化配置。

## 云同步（可选）
1. 开通云环境，复制环境 ID（如 `xxx-yyy`）。
2. 部署云函数：右键 `cloudfunctions/login` → “上传并部署：云端安装依赖”。
3. 设置页 → 开启云同步并填写环境 ID → 保存 → 可点“立即同步”。
4. 合并规则：
   - 主键：`dateKey`（`YYYY-MM-DD`）；云端 `_id = openid_dateKey`
   - 冲突：较新的 `ts` 覆盖；空记录代表删除对端

## 图表（ECharts）
- 将官方 `echarts.min.js` 复制到：`/ec-canvas/echarts.js`
- 无该文件则自动回退到 Canvas 绘制，功能不受影响。

## 数据结构（v2）
- 键：`YYYY-MM-DD`
- 值：`{ mood: string, note?: string, ts: number }`
- 存储键：`mood_records_v2`

## 隐私与合规
- 隐私页：`pages/privacy/index`（设置页入口“隐私政策”）
- 数据：默认仅本地；开启云同步后与云端按 openid 关联。
- 无第三方 SDK，不申请敏感权限。

## 贡献
欢迎 PR！建议先阅读 `CONTRIBUTING.md`。

## 许可证
本项目采用 MIT 许可证，详见 `LICENSE`。

## 发展路线
详见 `ROADMAP.md`（统计增强交互、搜索导出、数据加密、i18n、自动化测试、CI/CD 等）。

## 变更记录
请参阅 `changelog/` 目录。
