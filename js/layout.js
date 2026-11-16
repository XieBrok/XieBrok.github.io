/* ==========================================================================
 * 公共页眉与页脚渲染器（js/layout.js）
 * --------------------------------------------------------------------------
 * 统一维护全站导航栏（<nav>）与页脚（<footer>），只需修改此处即可同步所有页面。
 * 必须在 js/theme.js、各页面 *lang.js、js/typing.js、js/loader.js 之前同步执行，
 * 确保主题按钮、语言切换按钮、打字机目标及遮罩 inert 控制能立即获取到 DOM。
 * ========================================================================== */
(function () {
    'use strict';

    var NAV_ITEMS = [
        { key: 'home', href: '/', label: '首页' },
        { key: 'comment', href: '/comment.html', label: '留言板' },
        { key: 'about', href: '/about.html', label: '自我介绍' }
    ];

    function detectActiveNav(headerEl) {
        var explicit = headerEl.getAttribute('data-nav-active');
        if (explicit) {
            return explicit;
        }
        var path = (window.location.pathname || '/').toLowerCase();
        if (/\/comment(?:\.html)?$/.test(path)) {
            return 'comment';
        }
        if (/\/about(?:\.html)?$/.test(path)) {
            return 'about';
        }
        return 'home';
    }

    function renderHeader(headerEl) {
        var activeKey = detectActiveNav(headerEl);
        var itemsHtml = NAV_ITEMS.map(function (item) {
            var isActive = item.key === activeKey;
            var itemClass = isActive ? 'nav-item active' : 'nav-item';
            var currentAttr = isActive ? ' aria-current="page"' : '';
            return (
                '<li class="' + itemClass + '">' +
                '<a class="nav-link" href="' + item.href + '"' + currentAttr + '>' + item.label + '</a>' +
                '</li>'
            );
        }).join('');

        headerEl.outerHTML =
            '<nav class="navbar navbar-expand-lg site-navbar" aria-label="主导航">' +
                '<img src="/logo/H_.png" class="logo" alt="HHYYYY 标志" width="128" height="128">' +
                '<a class="navbar-brand" href="/">HHYYYY</a>' +
                '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="展开或收起导航菜单">' +
                    '<span class="navbar-toggler-icon"></span>' +
                '</button>' +
                '<div class="collapse navbar-collapse" id="navbarNav">' +
                    '<ul class="navbar-nav">' +
                        itemsHtml +
                        '<li class="nav-item">' +
                            '<button type="button" class="theme-toggle" data-theme-toggle aria-label="主题跟随系统，点击切换到浅色模式" title="主题跟随系统，点击切换到浅色模式">' +
                                '<svg class="theme-toggle__icon theme-toggle__icon--auto" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
                                    '<circle cx="12" cy="12" r="8.5"/>' +
                                    '<path d="M12 3.5A8.5 8.5 0 0 0 12 20.5Z" fill="currentColor" stroke="none"/>' +
                                '</svg>' +
                                '<svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                    '<path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9z"/>' +
                                '</svg>' +
                                '<svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                    '<circle cx="12" cy="12" r="4.2"/>' +
                                    '<path d="M12 2.6v2.1M12 19.3v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5"/>' +
                                '</svg>' +
                            '</button>' +
                        '</li>' +
                    '</ul>' +
                '</div>' +
            '</nav>';
    }

    function renderFooter(footerEl) {
        var showExtra = footerEl.getAttribute('data-footer-extra') === 'true';
        var extraHtml = showExtra
            ? (
                '<p class="h3" id="typing-end">INFINITY PROGRESS.</p>' +
                '<p class="h4" data-lang-key="thanks">Thanks to the following outstanding open-source projects</p>' +
                '<p class="h4" id="thanks-links">' +
                    '<a href="https://github.com/MauritsWilke/mcpfp" target="_blank" rel="noopener">MCPFP</a> ' +
                    '<a href="https://github.com/WenqiOfficial/StudyWithMiku" target="_blank" rel="noopener">STUDY With Miku</a>' +
                '</p>' +
                '<p>fonts by <a href="https://www.jetbrains.com/lp/mono/" target="_blank" rel="noopener">JetBrains mono</a></p>'
            )
            : '';

        footerEl.outerHTML =
            '<footer class="text-center py-3 mt-5">' +
                '<p>&copy; 2026 HHYYYY. MIT License.</p>' +
                extraHtml +
                '<div class="language-switcher">' +
                    '<button id="switch-to-en" class="btn btn-secondary btn-sm" type="button">English</button>' +
                    '<button id="switch-to-zh" class="btn btn-secondary btn-sm" type="button">中文</button>' +
                '</div>' +
                '<a href="https://icp.gov.moe/?keyword=20258500" target="_blank" rel="noopener">萌ICP备20258500号</a> ' +
                '<a href="https://icp.redcha.cn/beian/ICP-2025110221.html" title="茶ICP备2025110221号" target="_blank" rel="noopener">茶ICP备2025110221号</a>' +
            '</footer>';
    }

    var headerEl = document.getElementById('site-header');
    if (headerEl) {
        renderHeader(headerEl);
    }

    var footerEl = document.getElementById('site-footer');
    if (footerEl) {
        renderFooter(footerEl);
    }
})();
