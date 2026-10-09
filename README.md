# AOI OMOI · BGA / MV

原创 Happycore《AOI OMOI》的 MV（BGA）制作源码。

- **音乐**：idoo。音频不包含在本仓库中。
- **MV 策划 / 导演**：idoo
- **MV 制作**：Claude Opus 5.5。画面全部由程序逐帧绘制。

整部 MV 是一个 HTML 页面里的 Canvas 2D 程序。`renderAt(t)` 对任意时刻 t 都画出同一帧，所以可以多进程并行逐帧导出，也可以随时抽取任意一帧检查。成片为 1080p、60fps，共 15159 帧，没有使用实拍画面和图像生成模型。云是参照公开授权的照片描成的扁平卡通形状，出处见 [assets/CREDITS.md](assets/CREDITS.md)。

## 目录

| 路径 | 内容 |
|---|---|
| `src/` | 画面程序，按场景分文件；`k_story.js` 是分镜（场景名、起止小节）。还有从音乐分析出的数据：鼓点、响度、频谱包络（60fps 每帧一个值），以及钢琴音符时间 |
| `build.py` | 把 `src/` 拼成一个页面：`python build.py build/index.html --local` |
| `tools/` | 导出、校验、检查工具，以及音乐分析和素材处理脚本（见下文） |
| `assets/` | 用到的 22 朵卡通云（webp）和云的槽位表 `clouds.json` |
| `docs/制作过程.md` | 从第一版到成片的主要决定和经验 |

## 本地预览

需要 Python 3（以及 numpy、opencv-python、playwright、Pillow）和 ffmpeg。

```bash
python build.py build/index.html --local
python -m http.server 8767 --directory build
```

浏览器打开 `http://127.0.0.1:8767/index.html?test=1&w=960`。没有音频时，页面仍能按时间画出每一帧。

## 导出

导出需要自备音频，放在 `build/audio.mp4`（AAC）：

```bash
python tools/export.py --out renders/out.mp4 --audio build/audio.mp4 --jobs 4
python tools/verify.py renders/out.mp4
```

## 检查工具

- `tools/tsheet.py`：从页面截取指定时刻，拼成检查表。
- `tools/vsheet.py`：从成片截取检查表。`grid` 按时间间隔取帧；`cuts` 在每个切点前后各取几帧。
- `tools/framescan.py`：逐帧找局部突变（POP）和跟着鼓点的抖动（STEP）。
- `tools/liveness.py`：每小节对比画面活跃度和音乐响度，找出音乐满而画面静的地方。
- `tools/jscheck.py`：检查构建后的页面能否正常加载。

## 许可

- **代码**（`src/*.js`、`src/head.html`、`build.py`、`tools/`）：MIT，见 [LICENSE](LICENSE)。
- **文档和卡通云素材**（`docs/`、`assets/`）：CC BY 4.0，见 [LICENSE-ASSETS.md](LICENSE-ASSETS.md)。卡通云改绘自他人的 CC BY 照片，再使用时也需要署原作者，见 [assets/CREDITS.md](assets/CREDITS.md)。
- **音乐《AOI OMOI》及其分析数据**（`src/*.bin`、`src/*.json`）：版权归作曲者所有，仅供本项目渲染使用。

---

**English**: Source of the music video for the original Happycore track *AOI OMOI*. The whole MV is a deterministic Canvas 2D program (`renderAt(t)`), rendered frame by frame at 1080p60. Code under MIT; docs and the cartoon-cloud assets under CC BY 4.0 (the clouds are redrawn from CC-licensed photos, credited in `assets/CREDITS.md`). The audio is not included.
