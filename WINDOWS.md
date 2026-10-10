# Windows 接手编辑指南

## 1. 启动项目

1. 下载 GitHub 仓库 ZIP 并完整解压，或解压 Windows 接手包。不要在压缩文件内直接运行。
2. 安装 [Node.js LTS](https://nodejs.org/en/download) 或 [Python 3](https://www.python.org/downloads/windows/)，两者任选其一；无需 npm install。
3. 双击 `start-windows.cmd`。启动器优先使用 Node.js 18+，其次使用 Python 3.8+，自动打开本地网址。
4. 保持启动窗口打开。停止时按 Ctrl+C；关闭窗口后本地预览也会停止。

脚本自动识别两种目录结构：Sites 源码的 `dist/index.html`，以及 GitHub Pages 仓库根目录的 `index.html`。不依赖盘符、当前工作目录，支持中文和含空格的路径。默认使用 8765 端口，占用时自动尝试至 8774；仅监听本机。

不能直接双击 index.html：场景使用 ES 模块，需要 HTTP 本地服务。使用当前 Windows Edge、Chrome 或 Firefox，并开启浏览器硬件加速。

命令行也可启动：

```powershell
node .\preview.mjs
# 或
py -3 .\preview.py
# 自定义端口
node .\preview.mjs --port 8800
```

## 2. 修改网页与程序化模型

用任意代码编辑器打开解压后的项目文件夹。Sites 源码编辑 `dist/` 内文件；GitHub Pages 源码直接编辑根目录同名文件。

| 文件 | 修改内容 |
| --- | --- |
| app.js | 地界、道路、树木间距、建筑坐标和朝向、相机、交互与模型导出 |
| detail-design.js | 六个房间家具、材料、围墙、大门、排水及设备细节 |
| style.css | 面板、地图和手机控件样式 |
| index.html | 页面按钮、文字、资源版本号和模块入口 |
| design-guide.html | 客户设计说明 |
| vendor/ | Three.js 及工具，保留目录和版权信息 |

保存后刷新本地页面。预览服务器禁用缓存，无需构建。修改坐标时保留原地界和比例；最终重新检查外轮廓是否越界、步行通道与车辆通行是否受阻。

## 3. Blender 可视化编辑

1. 线上或本地场景展开面板，点击“导出完整设计模型”，取得 GLB；接手包内也提供当前模型。
2. 使用 Blender 4.0 或更高版本：文件 → 导入 → glTF 2.0，选择 GLB。
3. 模型采用米制，保留中文对象名称、房间和设施层级。树木等使用 `EXT_mesh_gpu_instancing`，Blender 4.0 起可导入；实例共享网格数据。
4. 若只修改一棵树的形状，先将该对象的网格数据设为单用户，避免所有共享实例一起变化。
5. 保存 `.blend` 继续编辑，也可导出修改后的 GLB。

**Blender 修改不会自动回写 app.js，也不会自动替换线上场景。** 当前网站通过 JavaScript 生成模型，源码编辑和 GLB 编辑是两条不同流程。若要把 Blender 成果用于网站，需另行接入模型加载流程。

## 4. 发布到 GitHub Pages

在仓库网页或 Git 客户端提交修改。GitHub Pages 仓库将网页文件放在根目录，保留 `vendor/` 和全部相对引用。Sites 源码中的网页文件在 `dist/`，同步到 Pages 时对应其根目录。等待 Pages 部署成功再查看；必要时更新 index.html 中 JS/CSS 版本参数。

## 自检范围与已知情况

已检查源码无 macOS 专用运行依赖、所有资源为本地相对路径；Node 与 Python 预览入口按中文路径和两种目录结构验证，检查 JS 的正确 MIME 类型、缓存及端口占用回退。当前执行环境为 macOS，无法宣称 Windows 实机或 Windows 版 Blender 导入已经测试。Windows CMD 启动器已按标准命令和 CRLF 行尾编写，实际显卡、驱动和浏览器仍需在接手电脑上确认。

大门目前为配套参考方案，独立图稿尚待提供；现场尺寸与施工深化状态保持原交付说明。

参考：[Blender 4.0 导入实例扩展说明](https://developer.blender.org/docs/release_notes/4.0/add_ons/)，[Blender glTF 操作手册](https://docs.blender.org/manual/en/4.2/addons/import_export/scene_gltf2.html)。
