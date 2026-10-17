# CoForge Lab · 共研实验室

用于验证人主导、AI Agent 执行的产研协作流程。

## 首个实验：需求收集小工具

使用 Vue 3 + Vite + TypeScript 实现的纯前端需求收集工具，包含以下功能：

- 新增需求：标题必填，描述选填。
- 展示需求列表，新增的需求显示在列表顶部。
- 按状态筛选需求：全部、待处理、进行中、已完成，默认展示全部；筛选控件旁显示各状态的需求数量统计。
- 描述超过 80 个字符时默认折叠为前 80 个字符加省略号，可逐条展开或收起；较短描述完整显示。
- 修改需求状态：待处理、进行中、已完成。
- 删除需求：点击删除按钮并确认后移除对应需求；取消则保留。
- 使用浏览器本地存储（`localStorage`），刷新页面后保留数据。

第一版不包含后端服务、登录或多人权限。所有数据仅保存在当前浏览器中。

## 本地运行

环境要求：Node.js 22.12 及以上、npm。

```bash
npm install
npm run dev
```

终端会输出本地访问地址，默认是 <http://localhost:5173>。

生产构建与预览：

```bash
npm run build
npm run preview
```

## 测试

```bash
# 单次运行全部单元测试与组件测试
npm run test:run

# 监听模式
npm run test

# TypeScript 类型检查
npm run typecheck
```

## 项目结构

```text
src/
├── App.vue                      # 页面组装
├── main.ts                      # 应用入口
├── styles.css                   # 全局样式
├── components/
│   ├── RequirementForm.vue      # 新增需求表单
│   ├── RequirementList.vue      # 需求列表
│   └── RequirementItem.vue      # 单条需求、状态修改与删除
├── composables/
│   └── useRequirements.ts       # 需求读写与 localStorage 持久化
├── types/
│   └── requirement.ts           # 类型与状态定义
└── __tests__/                   # 单元测试与组件测试
```

本地存储键为 `coforge-lab.requirements.v1`。存储内容损坏或格式非法时，应用会忽略无效数据并正常启动。

## 验证流程

1. 调查仓库，整理实现方案、验收标准和测试计划。
2. 人工确认方案后，开始编码与测试。
3. 查看代码改动、实际测试结果和审查意见。
4. 人工完成最终验收。

## 当前状态

第一版已实现，等待人工验收。
