/* 滚动进入视口动画（reveal-on-scroll）
 * 触发：元素进入视口（IntersectionObserver）
 * 效果：由 CSS（index.css）按非线性曲线执行滑入 + 淡入
 * 优先级：入场任务提交给 AnimationPriority（REVEAL 级）。
 *        页面加载动画（LOAD 级，最高优先级）播放期间，所有入场任务排队等待，
 *        加载完成后按优先级执行 —— 实现"加载动画置前"。
 * 降级：1) 系统开启"减少动态效果" → 直接全部显示，不做任何隐藏；
 *       2) 无 IntersectionObserver（老浏览器）→ 直接全部显示；
 *       3) 调度器缺失（animation-priority.js 未加载）→ 直接入场，不排队；
 *       4) JS 被禁用 → html 保持 no-js，CSS 不隐藏任何元素。
 */
(function () {
    'use strict';

    var docEl = document.documentElement;
    docEl.classList.remove('no-js');
    docEl.classList.add('js');

    var revealEls = document.querySelectorAll('.row > [data-reveal]');
    if (!revealEls.length) {
        return;
    }

    var scheduler = window.AnimationPriority || null;

    // 降级 1：系统偏好"减少动态效果" → 跳过隐藏与观察，直接展示全部
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealEls.forEach(function (el) { el.classList.add('revealed'); });
        return;
    }

    // 降级 2：老浏览器无 IntersectionObserver → 不隐藏任何元素
    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('revealed'); });
        return;
    }

    // 首屏前 3 张卡片附加递增延迟，形成波浪式入场（幂等）
    var firstBatchReady = false;
    function markFirstBatchDelay() {
        if (firstBatchReady) {
            return;
        }
        firstBatchReady = true;
        revealEls.forEach(function (el, index) {
            if (index >= 3) {
                return;
            }
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.animationDelay = (index * 0.12) + 's';
            }
        });
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }
            var el = entry.target;

            function play() {
                markFirstBatchDelay();
                el.classList.add('revealed');
                observer.unobserve(el);
            }

            if (scheduler && scheduler.isHeld()) {
                // 加载动画（最高优先级）进行中：入场任务入队，等待释放
                scheduler.submit(scheduler.LEVEL.REVEAL, play, 'scroll-reveal');
            } else {
                play();
            }
        });
    }, {
        threshold: 0.12,               // 进入视口 12% 即触发
        rootMargin: '0px 0px -32px 0px' // 底部留 32px 余量，略微提前触发
    });

    // 统一观察全部卡片：视口内的元素会被立即回调（含首屏），
    // 门控期间入队，加载动画完成后统一入场
    revealEls.forEach(function (el) {
        observer.observe(el);
    });
})();
