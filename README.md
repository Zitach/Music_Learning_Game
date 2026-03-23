# music-learning-game

一个基于 `React + TypeScript + Zustand + Tone.js` 的乐理学习游戏原型，当前正逐步从演示型项目重构为可持续迭代的前端应用基线。

## 当前能力范围

- 开场引导：标题、乐器选择、昵称输入
- 世界地图：章节入口与解锁路径
- 技能流程：学习、练习、考核三段式
- 本地进度：玩家与章节进度持久化
- 音频反馈：按键、确认、升级等基础音效

## 开发命令

- `npm run dev`：启动开发服务器
- `npm run typecheck`：运行 TypeScript 检查
- `npm run test:run`：运行测试
- `npm run validate:questions`：校验题库数据
- `npm run build`：构建生产包

## 目录结构

- `src/app`：应用流程与屏幕装配
- `src/features`：按功能划分的界面与交互逻辑
- `src/domain`：章节、题库、进度等纯规则与类型
- `src/stores`：Zustand 持久化状态
- `src/lib`：音频引擎、工具函数、Canvas 渲染
- `scripts`：静态校验脚本

## 已知限制

- 目前仍以本地静态题库为主
- 移动端体验仅做基础兼容
- 题型系统正在从页面内逻辑抽离到统一运行层
- 世界地图主交互仍依赖 canvas，已开始补充语义化入口

## Roadmap

1. 拆分 `App.tsx` 为 reducer + shell/router
2. 将题库拆为章节模块并加校验脚本
3. 统一练习/考核题目会话层
4. 提升地图可访问性与懒加载性能
5. 完善测试、文档和内容扩展规范
