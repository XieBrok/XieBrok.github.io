/* 友链数据加载与"角色卡"渲染
 * 1) 读取 /sourse/Links.md（Markdown 表格：名称 | 头像 | 简介）
 * 2) marked 渲染为表格后，转换为大角色卡网格（.friend-grid）
 *    —— 每个好友一张独立大卡片：大头像 + 名称 + 多行简介 + 网站访问按钮
 * 3) 修复了原实现在 head 中执行导致的 fetch 竞态问题
 */
(function () {
    'use strict';

    /**
     * 将 marked 渲染出的友链表格转换为角色卡网格 DOM。
     * @param {HTMLElement} root md-content 容器
     */
    function buildFriendCards(root) {
        var table = root.querySelector('table');
        if (!table) {
            return;
        }

        // 兼容 marked 有无 <tbody> 的渲染差异
        var rows = table.querySelectorAll('tbody tr');
        if (!rows.length) {
            rows = table.querySelectorAll('tr:not(:first-child)');
        }

        var cards = [];
        rows.forEach(function (row) {
            var cells = row.querySelectorAll('td');
            if (cells.length < 3) {
                return;
            }

            var nameAnchor = cells[0].querySelector('a');
            var avatar = cells[1].querySelector('img');

            cards.push({
                href: nameAnchor ? nameAnchor.getAttribute('href') : null,
                name: (nameAnchor ? nameAnchor.textContent : cells[0].textContent).trim(),
                src: avatar ? avatar.getAttribute('src') : '',
                desc: cells[2].textContent.trim()
            });
        });

        if (!cards.length) {
            return;
        }

        // 初始按钮文案跟随当前语言（此后由 language.js 的 data-lang-key 机制接管）
        var isZh = (navigator.language || navigator.userLanguage || 'en').indexOf('zh') === 0;

        // 生成角色卡网格（全部使用 createElement + textContent，避免 XSS）
        var grid = document.createElement('div');
        grid.className = 'friend-grid';

        cards.forEach(function (c) {
            // 卡片主体：不可嵌套链接，展示头像/名称/简介
            var card = document.createElement('div');
            card.className = 'friend-card';

            var avatar = document.createElement('img');
            avatar.className = 'friend-card__avatar';
            avatar.src = c.src;
            avatar.alt = c.name + (isZh ? ' 的头像' : ' avatar');
            avatar.loading = 'lazy';
            avatar.width = 96;
            avatar.height = 96;

            var name = document.createElement('span');
            name.className = 'friend-card__name';
            name.textContent = c.name;

            var desc = document.createElement('span');
            desc.className = 'friend-card__desc';
            desc.textContent = c.desc || '—';

            // 网站访问按钮（独立链接，避免卡片内嵌套 <a>）
            var link = document.createElement('a');
            link.className = 'friend-card__link';
            link.href = c.href || '#';
            link.target = '_blank';
            link.rel = 'noopener';
            link.setAttribute('data-lang-key', 'visitSite');
            link.textContent = isZh ? '访问网站' : 'Visit site';

            card.appendChild(avatar);
            card.appendChild(name);
            card.appendChild(desc);
            card.appendChild(link);
            grid.appendChild(card);
        });

        table.parentNode.replaceChild(grid, table);
    }

    function loadLinks() {
        var container = document.getElementById('md-content');
        if (!container) {
            console.warn('[links] #md-content 不存在，跳过友链加载');
            return;
        }
        fetch('/sourse/Links.md')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();
            })
            .then(function (text) {
                container.innerHTML = marked.parse(text);
                buildFriendCards(container);
            })
            .catch(function (err) {
                console.error('[links] 友链加载失败:', err);
                container.innerHTML = '<p>友链暂时加载失败，请稍后再试。</p>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadLinks);
    } else {
        loadLinks();
    }
})();
