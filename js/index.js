// 友链数据加载：修复原代码在 head 中执行导致的竞态问题
// （原实现 fetch 先于 DOM 解析完成，可能找不到 #md-content 而抛错）
(function () {
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
