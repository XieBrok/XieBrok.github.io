/* ==========================================================================
 * 首页分屏滚动控制器（js/index-scroll.js）
 * --------------------------------------------------------------------------
 * - 配合 css/index.css 的 scroll-snap，实现 4 个整屏部分上下切换
 * - 使用中心视口带 IntersectionObserver 跟踪当前激活屏，更新右侧指示圆点
 * - 支持点击右侧圆点与每屏底部向下按钮平滑跳转，并随 languagechange 更新文案
 * ========================================================================== */
(function () {
    'use strict';

    var panels = Array.prototype.slice.call(document.querySelectorAll('.home-panel'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.section-dots__btn'));
    var nextBtns = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-next]'));
    if (!panels.length) {
        return;
    }

    var LABELS = {
        zh: {
            nav: '页面部分导航',
            sections: ['概览', '兴趣领域', '高光与社区', '更多与页脚'],
            next: '向下滚动到下一部分'
        },
        en: {
            nav: 'Page section navigation',
            sections: ['Overview', 'Interests', 'Highlights & Community', 'More & Footer'],
            next: 'Scroll to next section'
        }
    };

    var currentLang = (navigator.language || navigator.userLanguage || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';

    function syncLabels(lang) {
        var pack = LABELS[lang] || LABELS.zh;
        var navEl = document.querySelector('.section-dots');
        if (navEl) {
            navEl.setAttribute('aria-label', pack.nav);
        }
        dots.forEach(function (dot, idx) {
            var label = pack.sections[idx] || '';
            if (label) {
                dot.setAttribute('aria-label', label);
                dot.setAttribute('title', label);
            }
        });
        nextBtns.forEach(function (btn) {
            btn.setAttribute('aria-label', pack.next);
            btn.setAttribute('title', pack.next);
        });
    }

    function setActiveDot(activeIndex) {
        dots.forEach(function (dot, idx) {
            var isActive = idx === activeIndex;
            dot.classList.toggle('is-active', isActive);
            if (isActive) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    }

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function scrollToPanel(index) {
        var target = panels[index];
        if (!target) {
            return;
        }
        target.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    dots.forEach(function (dot, idx) {
        dot.addEventListener('click', function () {
            scrollToPanel(idx);
        });
    });

    nextBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var targetIdx = parseInt(btn.getAttribute('data-scroll-next'), 10);
            if (!isNaN(targetIdx)) {
                scrollToPanel(targetIdx);
            }
        });
    });

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                var idx = panels.indexOf(entry.target);
                if (idx !== -1) {
                    setActiveDot(idx);
                }
            });
        }, {
            rootMargin: '-45% 0px -45% 0px',
            threshold: 0
        });

        panels.forEach(function (panel) {
            observer.observe(panel);
        });
    }

    document.addEventListener('languagechange', function (e) {
        if (e.detail && e.detail.lang) {
            currentLang = e.detail.lang === 'zh' ? 'zh' : 'en';
            syncLabels(currentLang);
        }
    });

    syncLabels(currentLang);
    setActiveDot(0);
})();
