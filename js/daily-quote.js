/* ==========================================================================
 * 每日一言（js/daily-quote.js）—— 单句轮播版
 * --------------------------------------------------------------------------
 * 优先级：本脚本以"遮罩元素之后的第一个同步 <script>"加载，页面首帧
 * 绘制前完成首句注入，不依赖 DOMContentLoaded / load / 其他脚本。
 *
 * 功能：
 *   1. 单句展示：每次仅显示一句话，简洁聚焦
 *   2. 切换动画：淡出(0.3s) → 更换文本 → 淡入(0.4s)，总时长 ~0.8s
 *   3. 轮播机制：默认 6s 自动切换，循环播放（播完从头开始）
 *   4. 词库：55 条，涵盖 励志 / 治愈 / 哲理 / 古诗词 / 格言 五类；
 *      数据结构为 [{ text, cat }]，预留扩展位（可直接追加条目，
 *      或将来替换 loadQuotes 改为从接口获取）
 *   5. 长句自适应：按字符数分三级字号，自动换行，不溢出不遮挡
 *   6. 交互：可配置 ALLOW_MANUAL；点击或水平滑动切换下一句，
 *      手动切换会重置自动轮播定时器，互不冲突
 * 降级：HTML 已预置默认文案；脚本异常静默；reduced-motion 下停用
 * 自动轮播与过渡动画（仍保留手动切换）。
 * ========================================================================== */
(function () {
    'use strict';

    /* ---------- 配置（可调） ---------- */
    var CONFIG = {
        INTERVAL: 6000,        // 自动切换间隔（5~8s 区间内）
        FADE_OUT_MS: 300,      // 淡出时长
        FADE_IN_MS: 400,       // 淡入时长（过渡总时长 ~0.8s）
        ALLOW_MANUAL: true,    // 允许点击 / 滑动切换
        START_WITH_TODAY: true // 首句按日期选取（兼具"每日一言"语义）
    };

    /* ---------- 词库（55 条；可直接追加，或将来接入接口） ---------- */
    var QUOTES = [
        /* 励志 */
        { text: '求知若饥，虚心若愚。—— Steve Jobs', cat: 'motivate' },
        { text: '无限进步，胜过完美停留。', cat: 'motivate' },
        { text: '星光不问赶路人，时光不负有心人。', cat: 'motivate' },
        { text: '每一个不曾起舞的日子，都是对生命的辜负。—— 尼采', cat: 'motivate' },
        { text: '不是因为看到希望才坚持，而是坚持了才看到希望。', cat: 'motivate' },
        { text: '今天的学习，是明天的底气。', cat: 'motivate' },
        { text: '只有极其努力，才能看起来毫不费力。', cat: 'motivate' },
        { text: '你逆光而来，配得上这世间所有美好。', cat: 'motivate' },
        { text: '半山腰太挤了，我们山顶见。', cat: 'motivate' },
        { text: '所有的为时已晚，其实都是恰逢其时。', cat: 'motivate' },
        { text: '保持热爱，奔赴山海。', cat: 'motivate' },
        { text: '行动是治愈焦虑的良药。', cat: 'motivate' },

        /* 治愈 */
        { text: '慢慢来，比较快。', cat: 'heal' },
        { text: '没关系，天空越黑，星星越亮。', cat: 'heal' },
        { text: '温柔地拥抱世界，世界也会温柔待你。', cat: 'heal' },
        { text: '累了就休息，休息是为了走更远的路。', cat: 'heal' },
        { text: '你所有的努力，终会在某个时刻被看见。', cat: 'heal' },
        { text: '生活明朗，万物可爱。', cat: 'heal' },
        { text: '好好吃饭，好好睡觉，好好生活。', cat: 'heal' },
        { text: '允许一切发生，接纳每个当下的自己。', cat: 'heal' },
        { text: '治愈自己的，从来不是时间，而是内心的释怀。', cat: 'heal' },
        { text: '愿你眼里有光，心中有爱，脚下有路。', cat: 'heal' },
        { text: '把烦恼丢进风里，把快乐装进口袋。', cat: 'heal' },
        { text: '人间值得，未来可期。', cat: 'heal' },

        /* 哲理 */
        { text: '万物皆有裂痕，那是光照进来的地方。—— 莱昂纳德·科恩', cat: 'philosophy' },
        { text: '认识你自己。—— 苏格拉底', cat: 'philosophy' },
        { text: '我思故我在。—— 笛卡尔', cat: 'philosophy' },
        { text: '未经审视的人生不值得过。—— 苏格拉底', cat: 'philosophy' },
        { text: '简单是终极的复杂。—— 达·芬奇', cat: 'philosophy' },
        { text: '与其临渊羡鱼，不如退而结网。', cat: 'philosophy' },
        { text: '完成比完美更重要。', cat: 'philosophy' },
        { text: '把复杂留给代码，把简单留给用户。', cat: 'philosophy' },
        { text: '每一次调试，都是与逻辑的对话。', cat: 'philosophy' },
        { text: '代码改变世界，逻辑解构真理。', cat: 'philosophy' },
        { text: '少即是多。', cat: 'philosophy' },
        { text: '路虽远，行则将至；事虽难，做则必成。', cat: 'philosophy' },

        /* 古诗词 */
        { text: '路漫漫其修远兮，吾将上下而求索。—— 屈原', cat: 'poetry' },
        { text: '长风破浪会有时，直挂云帆济沧海。—— 李白', cat: 'poetry' },
        { text: '会当凌绝顶，一览众山小。—— 杜甫', cat: 'poetry' },
        { text: '天生我材必有用，千金散尽还复来。—— 李白', cat: 'poetry' },
        { text: '山重水复疑无路，柳暗花明又一村。—— 陆游', cat: 'poetry' },
        { text: '沉舟侧畔千帆过，病树前头万木春。—— 刘禹锡', cat: 'poetry' },
        { text: '千磨万击还坚劲，任尔东西南北风。—— 郑燮', cat: 'poetry' },
        { text: '莫愁前路无知己，天下谁人不识君。—— 高适', cat: 'poetry' },
        { text: '纸上得来终觉浅，绝知此事要躬行。—— 陆游', cat: 'poetry' },
        { text: '博观而约取，厚积而薄发。—— 苏轼', cat: 'poetry' },
        { text: '不畏浮云遮望眼，自缘身在最高层。—— 王安石', cat: 'poetry' },
        { text: '海内存知己，天涯若比邻。—— 王勃', cat: 'poetry' },

        /* 格言（英文） */
        { text: 'Stay hungry, stay foolish. —— Steve Jobs', cat: 'quote' },
        { text: 'The best way to predict the future is to create it.', cat: 'quote' },
        { text: 'Talk is cheap. Show me the code. —— Linus Torvalds', cat: 'quote' },
        { text: 'Make it work, make it right, make it fast.', cat: 'quote' },
        { text: 'Dream big, start small.', cat: 'quote' },
        { text: 'Code is poetry.', cat: 'quote' },
        { text: 'Keep it simple, stupid. (KISS)', cat: 'quote' },
        { text: 'Simplicity is the soul of efficiency. —— Austin Freeman', cat: 'quote' }
    ];

    /* ---------- 状态 ---------- */
    var quoteEl = null;       // 单句元素
    var index = 0;            // 当前索引
    var timer = null;         // 自动轮播定时器
    var touchX = 0;           // 滑动起始 X
    var switching = false;    // 切换中锁（防连点打断动画）
    var reduced = false;      // 系统减少动效

    /** 起始索引：按日期选取（YYYYMMDD 取模），兼具每日一言语义 */
    function startIndex() {
        if (!CONFIG.START_WITH_TODAY) {
            return 0;
        }
        var now = new Date();
        var seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        return Math.abs(seed) % QUOTES.length;
    }

    /** 长句字号分级（<=22 正常 / <=40 中 / >40 小），配合自动换行 */
    function applyTextSize(text) {
        if (!quoteEl) return;
        quoteEl.classList.remove('loader-quote__text--md', 'loader-quote__text--sm');
        if (text.length > 40) {
            quoteEl.classList.add('loader-quote__text--sm');
        } else if (text.length > 22) {
            quoteEl.classList.add('loader-quote__text--md');
        }
    }

    /** 立即显示指定索引的句子（无动画） */
    function show(indexToShow) {
        var item = QUOTES[indexToShow % QUOTES.length];
        if (!quoteEl) return;
        quoteEl.textContent = item.text;
        applyTextSize(item.text);
    }

    /** 平滑切换到下一句：淡出 → 换文 → 淡入 */
    function next() {
        if (!quoteEl || switching) {
            return;
        }
        switching = true;
        quoteEl.classList.add('loader-quote__text--fading');

        setTimeout(function () {
            index = (index + 1) % QUOTES.length; // 循环播放，播完从头开始
            var item = QUOTES[index];
            quoteEl.textContent = item.text;
            applyTextSize(item.text);
            quoteEl.classList.remove('loader-quote__text--fading'); // 淡入

            setTimeout(function () {
                switching = false;
            }, CONFIG.FADE_IN_MS);
        }, CONFIG.FADE_OUT_MS);
    }

    /** 重启自动轮播（手动切换后调用，保证与自动互不冲突） */
    function restartTimer() {
        stopTimer();
        if (reduced) {
            return; // 减少动效：不自动轮播
        }
        timer = setInterval(function () {
            // 遮罩可能已被 loader.js 移除：元素不在 DOM 则停止轮播
            if (!document.getElementById('quote-text')) {
                stopTimer();
                return;
            }
            next();
        }, CONFIG.INTERVAL);
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    /* ---------- 初始化 ---------- */
    function init() {
        quoteEl = document.getElementById('quote-text');
        if (!quoteEl) {
            return; // 保留 HTML 默认文案
        }

        reduced = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        index = startIndex();
        show(index);

        // 手动切换：点击 / 水平滑动（reduced-motion 下同样可用，仅无过渡动画）
        if (CONFIG.ALLOW_MANUAL) {
            quoteEl.addEventListener('click', function () {
                next();
                restartTimer();
            });

            quoteEl.addEventListener('touchstart', function (e) {
                touchX = e.touches[0].clientX;
            }, { passive: true });

            quoteEl.addEventListener('touchend', function (e) {
                var deltaX = e.changedTouches[0].clientX - touchX;
                if (Math.abs(deltaX) > 40) {
                    next();
                    restartTimer();
                }
            }, { passive: true });
        }

        // 减少动效：不启动自动轮播（手动切换仍可用，CSS transition 已禁用）
        if (reduced) {
            return;
        }

        restartTimer();
    }

    try {
        init();
    } catch (e) {
        /* 静默降级：保留 HTML 中的默认文案，遮罩不出现空白 */
    }
})();
