/* ==========================================================================
 * 全屏加载遮罩控制器（js/loader.js）
 * --------------------------------------------------------------------------
 * 流程：
 *   1) 页面加载：显示 #page-loader（覆盖全页、最顶层），禁用交互
 *      - body.loading（overflow:hidden）+ wheel/touchmove/方向键拦截 → 禁滚动
 *      - main/nav/footer 置 inert → 禁点击与键盘聚焦
 *   2) 等待 window load（所有图片/脚本/样式加载完成），4s 超时兜底
 *      （外部资源如友链头像可能缓慢，避免遮罩永久遮挡）
 *   3) 淡出遮罩（0.5s easeOut，由 CSS .loader-hidden 过渡）
 *      淡出同时给 body 添加 .page-ready，立即触发页面入场动画
 *      （遮罩淡出与入场动画重叠，过渡无空白、无闪烁）
 *   4) 遮罩移除（DOM 删除），恢复正常交互
 * 降级：
 *   - prefers-reduced-motion：直接移除遮罩，不播淡出/入场动画
 *   - window load 异常：4s 超时强制结束
 * ========================================================================== */
(function () {
    'use strict';

    /* ===== 每日一言：内置语录，按日期确定选取（当天固定、次日更新） ===== */
    var QUOTES = [
        '求知若饥，虚心若愚。—— Steve Jobs',
        'Stay hungry, stay foolish.',
        '代码如诗，简洁即美。',
        '无限进步，胜过完美停留。',
        '每一次调试，都是与逻辑的对话。',
        '把复杂留给代码，把简单留给用户。',
        '热爱可抵岁月漫长。',
        '不积跬步，无以至千里。',
        '保持好奇，保持热爱。',
        '完成比完美更重要。',
        '千里之行，始于足下。',
        '行动是治愈焦虑的良药。',
        '今天的学习，是明天的底气。',
        '慢慢来，比较快。',
        '梦想照亮前路，脚步丈量远方。',
        '星光不问赶路人，时光不负有心人。',
        '与其临渊羡鱼，不如退而结网。',
        '代码改变世界，逻辑解构真理。',
        '愿我们都能成为更好的自己。',
        '每个伟大的作品，都始于一行代码。',
        '路虽远，行则将至；事虽难，做则必成。',
        '学习是一场没有终点的旅行。'
    ];

    /** 按日期取当日语录（seed = YYYYMMDD → 稳定索引，当日固定） */
    function quoteOfTheDay() {
        var now = new Date();
        var seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        return QUOTES[Math.abs(seed) % QUOTES.length];
    }

    /** 将语录注入跑马灯轨道（两段相同文本实现无缝循环滚动） */
    function initDailyQuote() {
        var track = document.getElementById('quote-track');
        if (!track) {
            return;
        }
        var text = quoteOfTheDay();
        track.querySelectorAll('.loader-quote__item').forEach(function (item) {
            item.textContent = text;
        });
    }

    var loader = document.getElementById('page-loader');
    if (!loader) {
        return;
    }

    // 遮罩创建时立即注入每日一言（其后等待资源加载完成）
    initDailyQuote();

    var body = document.body;
    var interactives = [
        document.getElementById('main-content'),
        document.querySelector('nav'),
        document.querySelector('footer')
    ].filter(Boolean);

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 交互禁用 / 恢复 ---------- */
    function preventScroll(e) {
        e.preventDefault();
    }

    // 阻止方向键 / 空格 / PageUp / PageDown / Home / End 滚动
    function preventScrollKeys(e) {
        var k = e.key;
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End'].indexOf(k) !== -1) {
            e.preventDefault();
        }
    }

    function disableInteraction() {
        body.classList.add('loading');
        interactives.forEach(function (el) { el.setAttribute('inert', ''); });
        document.addEventListener('wheel', preventScroll, { passive: false });
        document.addEventListener('touchmove', preventScroll, { passive: false });
        document.addEventListener('keydown', preventScrollKeys);
    }

    function enableInteraction() {
        body.classList.remove('loading');
        interactives.forEach(function (el) { el.removeAttribute('inert'); });
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('keydown', preventScrollKeys);
    }

    /* ---------- 遮罩移除与入场动画触发 ---------- */
    function startEntrance() {
        // 遮罩淡出中即触发入场动画（与淡出重叠，衔接自然无空白）
        body.classList.add('page-ready');
        // 重置优先级调度器的门控超时：入场动画从此刻起算
        if (window.AnimationPriority && typeof window.AnimationPriority.rearm === 'function') {
            window.AnimationPriority.rearm();
        }
    }

    function removeLoader() {
        enableInteraction();
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }

    function fadeOutLoader() {
        startEntrance();
        loader.classList.add('loader-hidden');

        var done = false;
        function finish() {
            if (done) {
                return;
            }
            done = true;
            loader.removeEventListener('transitionend', onEnd);
            clearTimeout(fallback);
            removeLoader();
        }
        function onEnd(e) {
            if (e.propertyName === 'opacity') {
                finish();
            }
        }
        loader.addEventListener('transitionend', onEnd);
        // 兜底：transitionend 未触发（如元素被隐藏）时强制移除
        var fallback = setTimeout(finish, 900);
    }

    function finishLoading() {
        if (reduceMotion) {
            // 减少动效：直接移除，不播淡出/入场动画
            removeLoader();
            return;
        }
        fadeOutLoader();
    }

    /* ---------- 等待资源加载完成 ---------- */
    disableInteraction();

    var settled = false;
    function settle() {
        if (settled) {
            return;
        }
        settled = true;
        window.removeEventListener('load', settle);
        clearTimeout(fallbackTimer);
        finishLoading();
    }

    var fallbackTimer = setTimeout(settle, 4000); // 兜底：资源加载异常/过慢时强制结束
    window.addEventListener('load', settle);
})();
