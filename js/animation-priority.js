/* ==========================================================================
 * 动画优先级调度器（AnimationPriority）
 * --------------------------------------------------------------------------
 * 背景：页面加载入场动画（导航滑入 / 标题上移 / 页脚淡入）此前与首屏卡片
 *       reveal 入场并行播放（标题 0.1s 延迟 vs 卡片 0s/0.12s/0.24s 延迟），
 *       视觉上互相抢占，加载动画无法"置前"。
 *
 * 优先级层级（数值越大越优先）：
 *   REVEAL(10)        滚动入场 reveal（可被抢占，默认置后）
 *   INTERACTION(20)   悬停 / 按钮 / 语言切换等交互反馈（纯 CSS transition，
 *                     无 JS 排队需求，保留层级供扩展）
 *   MODAL(30)         模态框弹入（供扩展）
 *   LOAD(100)         页面加载入场动画 —— 最高优先级，置前
 *
 * 调度语义：
 *   1) hold()    加载动画开始，持有最高优先级：后续低优先级动画提交时入队；
 *   2) release() 加载动画全部结束（animationend ×3 或超时兜底），按优先级
 *                 降序、同级 FIFO 依次执行排队动画；
 *   3) forceRelease() 超时强制释放，防止"门控永久打开"导致卡片永不出现。
 *
 * 边界场景：
 *   - 打断：加载期间滚动/首屏入场请求 → 入队等待（不执行）
 *   - 中断恢复：加载完成 → 队列按优先级执行
 *   - 回退 a：JS 禁用 → html 保持 no-js，CSS 无动画，内容完整
 *   - 回退 b：本脚本未加载 → reveal.js 检测 window.AnimationPriority 缺失，
 *             直接入场（不排队）
 *   - 回退 c：animationend 异常 → setTimeout 超时强制释放
 *   - 回退 d：prefers-reduced-motion → 不启用门控，动画由 CSS 禁用
 * ========================================================================== */
(function (global) {
    'use strict';

    var LEVEL = {
        REVEAL: 10,       // 滚动入场（可被抢占）
        INTERACTION: 20,  // 交互反馈（预留）
        MODAL: 30,        // 模态框（预留）
        LOAD: 100         // 页面加载入场（最高，置前）
    };

    var held = false;     // 加载动画是否正在持有最高优先级（门控状态）
    var queue = [];       // 等待队列：{ level, fn, id, seq }
    var sequence = 0;     // 同级 FIFO 序号
    var everHeld = false; // 记录是否进行过门控（供日志/调试）

    var scheduler = {
        LEVEL: LEVEL,

        /** 是否处于"加载动画持有最高优先级"状态 */
        isHeld: function () {
            return held;
        },

        /**
         * 提交动画任务。
         * @param {number} level 优先级层级（LEVEL.*）
         * @param {Function} fn  动画执行函数
         * @param {string} [id]  任务标识（调试用）
         * @returns {boolean} true=立即执行；false=已入队等待
         */
        submit: function (level, fn, id) {
            if (typeof fn !== 'function') {
                return false;
            }
            if (!held) {
                fn();
                return true;
            }
            queue.push({ level: level, fn: fn, id: id || null, seq: sequence++ });
            // 优先级比较：层级高者置前；同层级按提交先后（FIFO）
            queue.sort(function (a, b) {
                return (b.level - a.level) || (a.seq - b.seq);
            });
            return false;
        },

        /** 加载动画开始：持有最高优先级 */
        hold: function () {
            held = true;
            everHeld = true;
        },

        /** 加载动画完成：释放门控并按优先级执行队列 */
        release: function () {
            if (!held) {
                return;
            }
            held = false;
            this._flush();
        },

        /** 超时强制释放（兜底，防止永久阻塞） */
        forceRelease: function () {
            held = false;
            this._flush();
        },

        _flush: function () {
            var tasks = queue.splice(0, queue.length);
            var self = this;
            tasks.forEach(function (task) {
                if (!held) {
                    task.fn();
                } else {
                    self.submit(task.level, task.fn, task.id); // 理论不触发，防御性重排
                }
            });
        }
    };

    global.AnimationPriority = scheduler;

    /* ===== 页面加载动画生命周期：hold → 全部结束 → release ===== */
    (function () {
        var docEl = global.document.documentElement;

        // 本脚本能执行即证明 JS 可用：接管 no-js → js 切换（与 reveal.js 幂等），
        // 使加载动画 CSS 规则(.js .navbar 等)生效。不可在此检查 no-js，
        // 因为本脚本在 reveal.js 之前执行，此时 html 仍带 no-js 类。
        docEl.classList.remove('no-js');
        docEl.classList.add('js');

        // 回退 d：系统减少动效 → 不启用门控（动画由 CSS 禁用，元素直接显示）
        if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        scheduler.hold();

        var LOAD_ANIMS = 3;                       // 导航 / 标题 / 页脚
        var LOAD_TIMEOUT = 1600;                  // 最长加载动画(0.3s延迟+0.8s) + 余量
        var remaining = LOAD_ANIMS;
        var done = false;

        function finish() {
            if (done) {
                return;
            }
            done = true;
            global.document.removeEventListener('animationend', onAnimEnd);
            clearTimeout(timer);
            scheduler.release();
        }

        function onAnimEnd(e) {
            var t = e.target;
            if (!t || !t.classList) {
                return;
            }
            var isLoadAnim = t.classList.contains('navbar') ||
                             t.classList.contains('tittle') ||
                             t.tagName === 'FOOTER';
            if (!isLoadAnim) {
                return;
            }
            if (--remaining <= 0) {
                finish();
            }
        }

        global.document.addEventListener('animationend', onAnimEnd);
        var timer = setTimeout(function () {
            // 回退 c：animationend 未如期触发（后台标签页、元素隐藏等）→ 强制释放
            finish();
        }, LOAD_TIMEOUT);
    })();
})(window);
