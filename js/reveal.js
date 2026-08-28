/* 滚动进入视口动画（reveal-on-scroll）
 * 触发：元素进入视口（IntersectionObserver）
 * 效果：由 CSS（index.css）按非线性曲线执行滑入 + 淡入
 * 降级：1) 系统开启"减少动态效果" → 直接全部显示，不做任何隐藏；
 *       2) 无 IntersectionObserver（老浏览器）→ 直接全部显示；
 *       3) JS 被禁用 → html 保持 no-js，CSS 不隐藏任何元素。
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

    // 系统偏好"减少动态效果"：跳过隐藏与观察，直接展示全部
    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        revealEls.forEach(function (el) {
            el.classList.add('revealed');
        });
        return;
    }

    // 老浏览器降级：不隐藏任何元素
    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) {
            el.classList.add('revealed');
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // 只播放一次
            }
        });
    }, {
        threshold: 0.12,            // 进入视口 12% 即触发
        rootMargin: '0px 0px -32px 0px' // 底部留 32px 余量，略微提前触发
    });

    revealEls.forEach(function (el, index) {
        // 首屏可见元素：立即呈现并依次错开（波浪式入场），无需等待滚动
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('revealed');
            if (index < 3) {
                el.style.animationDelay = (index * 0.12) + 's';
            }
        } else {
            observer.observe(el);
        }
    });
})();
