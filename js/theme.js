/* ==========================================================================
 * 主题切换控制器（js/theme.js）
 * --------------------------------------------------------------------------
 * - <head> 内联脚本已在首帧前写入 data-theme，避免闪白/闪黑
 * - 点击切换按钮 → 写入 localStorage('theme')，此后固定不再跟随系统
 * - 从未选择过 → 跟随系统深浅色偏好，系统切换时实时更新
 * - 主题变化时派发 themechange，粒子背景等订阅者据此重建配色
 * ========================================================================== */
(function () {
    'use strict';

    var KEY = 'theme';
    var root = document.documentElement;
    var media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

    var LABELS = {
        zh: { toDark: '切换到深色模式', toLight: '切换到浅色模式' },
        en: { toDark: 'Switch to dark mode', toLight: 'Switch to light mode' }
    };

    // 当前界面语言（随 language.js 派发的 languagechange 更新）
    var lang = (navigator.language || navigator.userLanguage || 'en').indexOf('zh') === 0 ? 'zh' : 'en';

    /* ---------- 主题读写 ---------- */

    function stored() {
        try {
            var v = localStorage.getItem(KEY);
            return (v === 'dark' || v === 'light') ? v : null;
        } catch (e) {
            return null; // 存储不可用（隐私模式等）时按"未选择"处理
        }
    }

    function system() {
        return media && media.matches ? 'dark' : 'light';
    }

    function get() {
        var attr = root.getAttribute('data-theme');
        if (attr === 'dark' || attr === 'light') {
            return attr;
        }
        return stored() || system();
    }

    function apply(theme, persist) {
        if (theme !== 'dark' && theme !== 'light') {
            return;
        }
        var changed = root.getAttribute('data-theme') !== theme;
        root.setAttribute('data-theme', theme);

        // 移动端浏览器地址栏配色跟随主题
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#121212' : '#eef0f4');
        }

        if (persist) {
            try {
                localStorage.setItem(KEY, theme);
            } catch (e) {
                /* 写入失败不影响本次切换 */
            }
        }

        if (changed) {
            document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
        }
    }

    /* ---------- 按钮文案与状态 ---------- */

    function syncLabel() {
        var dark = get() === 'dark';
        var text = LABELS[lang][dark ? 'toLight' : 'toDark'];
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.setAttribute('aria-label', text);
            btn.setAttribute('title', text);
            btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
        });
    }

    /* ---------- 初始化 ---------- */

    // 兜底：内联脚本缺失时补齐 data-theme（已一致则不会触发 themechange）
    apply(get(), false);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            apply(get() === 'dark' ? 'light' : 'dark', true);
        });
    });

    // 用户未显式选择时，跟随系统偏好变化
    if (media && typeof media.addEventListener === 'function') {
        media.addEventListener('change', function () {
            if (!stored()) {
                apply(system(), false);
            }
        });
    }

    document.addEventListener('languagechange', function (e) {
        if (e.detail && e.detail.lang) {
            lang = e.detail.lang === 'zh' ? 'zh' : 'en';
        }
        syncLabel();
    });

    document.addEventListener('themechange', syncLabel);

    window.HHTheme = { get: get, apply: apply };

    syncLabel();
})();
