# 电商素材工作台（E-commerce Material Workbench）

面向电商运营的 AI 内容创作工具：输入商品信息，一次生成抖音、小红书、淘宝三个平台的文案、卖点与营销海报，支持批量导入和模板复用。

**在线体验**：https://jxhhhhhh.github.io/ecommerce-material-workbench/

> 纯前端项目，无后端、无数据库。数据与历史记录保存在浏览器本地；首次点击 AI 功能会要求填写自己的 DeepSeek API Key（只存在本机浏览器，不会上传）。

## 功能

| 模块 | 说明 |
| --- | --- |
| 素材生成 | 输入商品名称、类目、卖点，调用大模型生成标题、卖点文案与平台化改写 |
| 多平台适配 | 抖音（短句、强节奏）、小红书（种草、体验感）、淘宝（卖点、转化）三套文案风格，同一商品一次输出 |
| 文案评分 | 从标题吸引力、信息完整度、平台适配度等维度给生成结果打分并给出修改建议 |
| A/B 对比 | 同商品多版本文案并列展示，便于挑选与继续迭代 |
| AI 润色 | 对已有文案二次优化，可调整语气、长度与平台风格 |
| 海报生成 | Canvas 2D 现场绘制商品海报，多套版式与配色，可导出 PNG |
| 批量生成 | 上传 Excel（.xlsx / .xls / .csv），按行读取商品批量生成素材，适合上新场景 |
| 模板库 | 把满意的生成结果存为模板，下次上新直接套用 |
| 历史记录 | 自动保存最近 50 条生成结果，支持按类型筛选、搜索、删除 |
| 个人中心 | 主题切换、数据统计、本地数据清理 |

## 技术栈

- React 18（UMD 版本，浏览器内直接运行）
- Babel Standalone（浏览器内实时编译 JSX，免构建）
- Canvas 2D（海报绘制与导出）
- SheetJS xlsx.full.min.js（Excel / CSV 解析）
- Font Awesome 6（图标）
- localStorage（历史记录、模板、主题、API Key）
- 大模型接口：DeepSeek Chat Completions API

## 本地运行

项目没有构建步骤，两种方式任选：

```bash
# 方式一：直接用浏览器打开 index.html
# 方式二：起一个本地静态服务（推荐，避免部分浏览器对本地文件的限制）
npx serve .
```

访问 http://localhost:3000 即可。首次使用 AI 功能时，在弹窗里填入自己的 DeepSeek API Key，之后自动保存在本机浏览器。

## 目录结构

```
index.html                 页面骨架、样式、第三方库引用
app.jsx                    主程序：所有页面组件与业务逻辑（约 4000 行）
history.js                 历史记录的读写模块
mockData.js                演示用模拟数据
babel.min.js               Babel Standalone（浏览器内编译 JSX）
react.development.js       React 18
react-dom.development.js   React DOM 18
xlsx.full.min.js           SheetJS，Excel / CSV 解析
app-new.jsx                早期重构尝试，未接入主流程
dataStore.js               早期数据层设计，未接入主流程
```

## 关于 API Key

API Key 不写入代码、不提交到仓库。程序按以下顺序取：

1. `window.__APP_CONFIG__.DEEPSEEK_KEY`（若外部注入了配置文件）
2. localStorage 中上次填过的 `deepseek_api_key`
3. 都没有时弹窗让用户输入，输入后存入 localStorage

若 Key 发生泄露，请到 DeepSeek 控制台吊销并重新生成，不要提交进仓库。

## 说明与限制

- 纯前端演示项目：没有用户系统与服务端，多设备之间数据不互通。
- 首页的「数据追踪」统计是演示数据（写死的示例数字），不是真实统计；真实可用的是历史记录页。
- 浏览器内 Babel 编译换来「零构建、双击即用」，代价是首屏多一次编译耗时；若要投产，建议改为离线预编译。
- `app-new.jsx` 与 `dataStore.js` 是历史遗留文件，未接入主流程，后续会清理。

## License

MIT