/* ==========================================================================
 * 主题切换控制器（js/theme.js）
 * --------------------------------------------------------------------------
 * 三态循环，点击按钮依次切换，图标显示"当前"模式：
 *     跟随系统(auto) → 浅色(light) → 深色(dark) → 跟随系统(auto) …
 * - <head> 内联脚本已在首帧前写入 data-theme / data-theme-mode，避免闪白/闪黑
 * - 选浅色/深色 → 写入 localStorage('theme')，此后固定不再跟随系统
 * - 选跟随系统 → 删除该记录，实时跟随系统深浅色偏好
 * - 模式记在 <html data-theme-mode> 上：localStorage 不可用（隐私模式）时
 *   仍能在本次会话内正常循环
 * - 主题变化时派发 themechange，粒子背景等订阅者据此重建配色
 * ========================================================================== */
(function () {
    'use strict';

    var KEY = 'theme';
    var MODES = ['auto', 'light', 'dark'];
    var NEXT = { auto: 'light', light: 'dark', dark: 'auto' };
    var root = document.documentElement;
    var media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

    var LABELS = {
        zh: {
            auto: '主题跟随系统，点击切换到浅色模式',
            light: '主题为浅色，点击切换到深色模式',
            dark: '主题为深色，点击切换到跟随系统'
        },
        en: {
            auto: 'Theme follows system, click to switch to light mode',
            light: 'Light theme, click to switch to dark mode',
            dark: 'Dark theme, click to switch to follow system'
        }
    };

    // 当前界面语言（随 language.js 派发的 languagechange 更新）
    var lang = (navigator.language || navigator.userLanguage || 'en').indexOf('zh') === 0 ? 'zh' : 'en';

    /* ---------- 状态读写 ---------- */

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

    // 当前模式：属性优先，localStorage 不可用时也能在本次会话内正常循环
    function mode() {
        var attr = root.getAttribute('data-theme-mode');
        return MODES.indexOf(attr) !== -1 ? attr : (stored() || 'auto');
    }

    // 某模式下实际生效的主题
    function resolve(m) {
        return m === 'auto' ? system() : m;
    }

    function get() {
        var attr = root.getAttribute('data-theme');
        if (attr === 'dark' || attr === 'light') {
            return attr;
        }
        return resolve(mode());
    }

    /* ---------- 渲染与切换 ---------- */

    function render(theme) {
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

        if (changed) {
            document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
        }
    }

    function setMode(m) {
        if (MODES.indexOf(m) === -1) {
            return;
        }
        root.setAttribute('data-theme-mode', m);

        try {
            if (m === 'auto') {
                localStorage.removeItem(KEY);
            } else {
                localStorage.setItem(KEY, m);
            }
        } catch (e) {
            /* 写入失败只影响下次打开，本次循环仍由 data-theme-mode 驱动 */
        }

        render(resolve(m));
        syncLabel();
    }

    /* ---------- 按钮文案 ---------- */

    function syncLabel() {
        var text = LABELS[lang][mode()];
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.setAttribute('aria-label', text);
            btn.setAttribute('title', text);
        });
    }

    /* ---------- 初始化 ---------- */

    // 兜底：内联脚本缺失时补齐属性（值已一致则不会触发 themechange）
    root.setAttribute('data-theme-mode', mode());
    render(resolve(mode()));

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            setMode(NEXT[mode()]);
        });
    });

    // 跟随系统模式下，实时响应系统深浅色变化
    if (media && typeof media.addEventListener === 'function') {
        media.addEventListener('change', function () {
            if (mode() === 'auto') {
                render(system());
            }
        });
    }

    document.addEventListener('languagechange', function (e) {
        if (e.detail && e.detail.lang) {
            lang = e.detail.lang === 'zh' ? 'zh' : 'en';
        }
        syncLabel();
    });

    window.HHTheme = { get: get, mode: mode, setMode: setMode };

    syncLabel();
})();
