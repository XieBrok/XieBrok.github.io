/* 友链数据加载与卡片化渲染
 * 1) 读取 /sourse/Links.md（Markdown 表格：名称 | 头像 | 简介）
 * 2) marked 渲染为表格后，转换为统一的卡片网格（.friend-grid）
 *    —— 头像 / 名称 / 简介对齐清晰，可点击整卡跳转，自适应列数
 * 3) 修复了原实现在 head 中执行导致的 fetch 竞态问题
 */
(function () {
    'use strict';

    /**
     * 将 marked 渲染出的友链表格转换为卡片网格 DOM。
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

        // 生成卡片网格（全部使用 createElement + textContent，避免 XSS）
        var grid = document.createElement('div');
        grid.className = 'friend-grid';

        cards.forEach(function (c) {
            var card = document.createElement('a');
            card.className = 'friend-card';
            card.href = c.href || '#';
            card.target = '_blank';
            card.rel = 'noopener';

            var img = document.createElement('img');
            img.className = 'friend-card__avatar';
            img.src = c.src;
            img.alt = c.name;
            img.loading = 'lazy';

            var info = document.createElement('span');
            info.className = 'friend-card__info';

            var name = document.createElement('span');
            name.className = 'friend-card__name';
            name.textContent = c.name;

            var desc = document.createElement('span');
            desc.className = 'friend-card__desc';
            desc.textContent = c.desc || '—';

            info.appendChild(name);
            info.appendChild(desc);
            card.appendChild(img);
            card.appendChild(info);
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
