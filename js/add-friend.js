/* ==========================================================================
 * 添加好友中心交互逻辑（js/add-friend.js）
 * --------------------------------------------------------------------------
 * 导航模型：弹窗内视图栈（main → detail → result），等价于页面级路由
 *   - 主列表(af-view-main)：搜索框 + 推荐网格 + 其他方式（扫码/通讯录）
 *   - 详情(af-view-detail)：好友/方式详情 + 主操作按钮
 *   - 结果(af-view-result)：添加成功提示
 * 跳转规则：
 *   - 推荐卡 / 方式卡 → 详情（push）
 *   - 详情 / 结果 → 返回列表（pop，统一返回键：按钮 / ESC / 遮罩）
 *   - 外部平台类(link)：主按钮跳转平台（防重复），随后进入结果视图
 *   - 复制类(copy)：复制 ID → 结果提示
 *   - 扫码类(info)：展示说明 → 完成关闭
 *   - 通讯录类(fail)：模拟"需要登录"失败场景 → 回退列表
 * 异常处理：
 *   - 搜索无结果 → 空态提示（af-empty）
 *   - 数据缺失 → 详情兜底"无法打开"，返回列表
 *   - modal 关闭/重开 → 视图栈与搜索状态重置
 * ========================================================================== */
(function () {
    'use strict';

    /* ---------- 数据（静态站内置；平台信息与链接） ---------- */
    var FRIENDS = {
        steam: {
            name: 'hichina',
            platform: 'Steam',
            desc: { zh: 'Steam 个人主页，添加后一起联机', en: 'Steam profile — add to play together' },
            icon: '/logo/steam.jpg',
            url: 'https://steamcommunity.com/id/hichina/',
            kind: 'link'
        },
        xbox: {
            name: 'hichina5833',
            platform: 'Xbox',
            desc: { zh: 'Xbox 玩家代号，主机端联机', en: 'Xbox Gamertag — crossplay ready' },
            icon: '/logo/xbox.jpg',
            url: 'https://www.xbox.com/play/user/hichina5833',
            kind: 'link'
        },
        minecraft: {
            name: 'HHYYYY',
            platform: 'Minecraft',
            desc: { zh: '我的世界 ID 卡，复制 ID 加好友', en: 'Minecraft ID card — copy to add' },
            icon: '/images/Minecraft_IDCARD.webp',
            url: '',
            kind: 'copy'
        },
        scan: {
            name: 'scan',
            platform: '扫码添加',
            desc: { zh: '在 Steam / Xbox 客户端内打开「扫码添加」，扫描我的个人主页二维码即可', en: 'Open "Scan QR" in Steam / Xbox app and scan my profile QR code' },
            icon: '',
            url: '',
            kind: 'info'
        },
        import: {
            name: 'import',
            platform: '通讯录导入',
            desc: { zh: '从系统通讯录导入联系人需要登录平台账号', en: 'Importing contacts requires signing in' },
            icon: '',
            url: '',
            kind: 'fail'
        }
    };

    /* ---------- 状态 ---------- */
    var stack = ['main'];      // 视图栈：当前视图在栈顶
    var jumping = false;       // 跳转防重锁
    var lastFriend = null;     // 当前详情对应数据 key

    var els = {};
    var modal = null;

    function $(id) { return document.getElementById(id); }

    function isZh() {
        return (navigator.language || navigator.userLanguage || 'en').indexOf('zh') === 0;
    }

    /* ---------- 视图切换 ---------- */
    var VIEWS = { main: 'af-view-main', detail: 'af-view-detail', result: 'af-view-result' };

    function showView(name) {
        Object.keys(VIEWS).forEach(function (v) {
            var el = $(VIEWS[v]);
            if (!el) return;
            if (v === name) {
                el.classList.add('af-view--active');
            } else {
                el.classList.remove('af-view--active');
            }
        });
    }

    function pushView(name) {
        stack.push(name);
        showView(name);
    }

    /** 统一返回：返回上一视图（栈顶弹出一个） */
    function goBack() {
        if (stack.length > 1) {
            stack.pop();
            showView(stack[stack.length - 1]);
        } else {
            closeModal();
        }
    }

    /** 重置到主列表（modal 关闭/重开时） */
    function resetToMain() {
        stack = ['main'];
        jumping = false;
        lastFriend = null;
        var input = els.searchInput;
        if (input) {
            input.value = '';
        }
        showView('main');
        renderRecommend('');
    }

    function closeModal() {
        if (modal && modal.modal && typeof modal.modal.hide === 'function') {
            modal.modal('hide'); // Bootstrap 4 jQuery 插件
        }
    }

    /* ---------- 渲染 ---------- */
    function renderRecommend(query) {
        var grid = els.recommendGrid;
        if (!grid) return;
        var q = (query || '').trim().toLowerCase();
        var shown = 0;
        grid.innerHTML = '';

        ['steam', 'xbox', 'minecraft'].forEach(function (key) {
            var f = FRIENDS[key];
            var hay = (f.name + ' ' + f.platform + ' ' + f.desc.zh + ' ' + f.desc.en).toLowerCase();
            if (q && hay.indexOf(q) === -1) {
                return;
            }
            shown++;
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'af-card';
            card.setAttribute('data-view-target', 'detail');
            card.setAttribute('data-friend', key);

            var avatar;
            if (f.icon) {
                avatar = document.createElement('img');
                avatar.className = 'af-card__avatar';
                avatar.src = f.icon;
                avatar.alt = f.platform;
                avatar.loading = 'lazy';
            } else {
                avatar = document.createElement('span');
                avatar.className = 'af-card__avatar af-card__avatar--letter';
                avatar.textContent = (f.platform || '?').charAt(0);
            }

            var info = document.createElement('span');
            info.className = 'af-card__info';
            var name = document.createElement('span');
            name.className = 'af-card__name';
            name.textContent = f.name;
            var plat = document.createElement('span');
            plat.className = 'af-card__platform';
            plat.textContent = f.platform;

            info.appendChild(name);
            info.appendChild(plat);
            card.appendChild(avatar);
            card.appendChild(info);
            grid.appendChild(card);
        });

        // 空态：无匹配结果
        var empty = els.empty;
        if (empty) {
            empty.hidden = shown > 0;
        }
        var methods = els.methods;
        if (methods) {
            methods.style.display = shown > 0 ? '' : 'none';
        }
        var titles = document.querySelectorAll('.af-section-title');
        titles.forEach(function (t) { t.style.display = shown > 0 ? '' : 'none'; });
    }

    /** 渲染详情视图（好友或方式） */
    function renderDetail(key) {
        var content = els.detailContent;
        if (!content) return;
        var f = FRIENDS[key];
        lastFriend = key;
        var zh = isZh();
        content.innerHTML = '';

        if (!f) {
            // 异常兜底：数据缺失
            var err = document.createElement('div');
            err.className = 'af-fail';
            err.textContent = zh ? '无法打开该好友' : 'Unable to open';
            content.appendChild(err);
            setPrimaryAction(zh ? '返回列表' : 'Back', function () { goBack(); });
            return;
        }

        // 大图（minecraft 显示 ID 卡；其余显示头像）
        if (f.kind === 'copy' && f.icon) {
            var big = document.createElement('img');
            big.className = 'af-detail__banner';
            big.src = f.icon;
            big.alt = f.platform;
            big.loading = 'lazy';
            content.appendChild(big);
        } else if (f.icon) {
            var av = document.createElement('img');
            av.className = 'af-detail__avatar';
            av.src = f.icon;
            av.alt = f.platform;
            av.loading = 'lazy';
            content.appendChild(av);
        }

        var name = document.createElement('p');
        name.className = 'af-detail__name';
        name.textContent = f.name + (f.kind === 'scan' || f.kind === 'import' ? '' : ' · ' + f.platform);
        content.appendChild(name);

        var desc = document.createElement('p');
        desc.className = 'af-detail__desc';
        desc.textContent = f.desc[zh ? 'zh' : 'en'];
        content.appendChild(desc);

        // 失败场景（通讯录导入）：失败提示
        if (f.kind === 'fail') {
            var fail = document.createElement('div');
            fail.className = 'af-fail';
            fail.textContent = zh ? '需要登录平台账号后才能导入通讯录' : 'Sign in required to import contacts';
            content.appendChild(fail);
            setPrimaryAction(zh ? '返回列表' : 'Back', function () { goBack(); });
            return;
        }

        // 主操作按钮
        if (f.kind === 'link') {
            setPrimaryAction(zh ? '打开平台添加' : 'Open platform', function () {
                if (jumping) return;      // 防重复跳转
                jumping = true;
                if (f.url) {
                    window.open(f.url, '_blank', 'noopener');
                }
                showResult(zh ? '已打开平台页面，请在平台内完成添加' : 'Platform opened — complete the request there');
            });
        } else if (f.kind === 'copy') {
            setPrimaryAction(zh ? '复制 ID' : 'Copy ID', function () {
                if (jumping) return;
                jumping = true;
                var done = false;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText('hichina5833').then(function () {
                        done = true;
                        showResult(zh ? 'ID 已复制到剪贴板' : 'ID copied to clipboard');
                    }).catch(function () {
                        showResult(zh ? '复制失败，请手动记录 ID' : 'Copy failed');
                    });
                } else {
                    showResult(zh ? 'ID 已复制到剪贴板' : 'ID copied to clipboard');
                }
            });
        } else if (f.kind === 'info') {
            setPrimaryAction(zh ? '知道了' : 'Got it', function () {
                closeModal();
            });
        }
    }

    /** 主按钮：单例绑定，避免重复监听 */
    function setPrimaryAction(text, handler) {
        var btn = els.primaryBtn;
        if (!btn) return;
        btn.textContent = text;
        btn._handler = handler;
    }

    /** 结果视图 */
    function showResult(subText) {
        var sub = els.resultSub;
        if (sub) {
            sub.textContent = subText;
        }
        pushView('result');
    }

    /* ---------- 事件绑定 ---------- */
    function bindEvents() {
        // 事件委托：推荐卡 / 方式卡 → 详情
        var body = els.body;
        if (body) {
            body.addEventListener('click', function (e) {
                var target = e.target.closest ? e.target.closest('[data-view-target]') : null;
                if (!target) return;
                var key = target.getAttribute('data-friend');
                if (FRIENDS[key]) {
                    renderDetail(key);
                    pushView('detail');
                }
            });
        }

        // 返回按钮
        var back = els.backBtn;
        if (back) {
            back.addEventListener('click', goBack);
        }

        // 主操作按钮（防重复跳转的 handler 由 setPrimaryAction 更新）
        var primary = els.primaryBtn;
        if (primary) {
            primary.addEventListener('click', function () {
                if (typeof primary._handler === 'function') {
                    primary._handler();
                }
            });
        }

        // 完成按钮：关闭弹窗（停留当前页，给出已完成提示后收起）
        var done = els.doneBtn;
        if (done) {
            done.addEventListener('click', closeModal);
        }

        // 搜索过滤（防抖 150ms）
        var input = els.searchInput;
        if (input) {
            input.addEventListener('input', function () {
                clearTimeout(input._timer);
                input._timer = setTimeout(function () {
                    renderRecommend(input.value);
                }, 150);
            });
        }

        // modal 重开：重置视图与搜索状态（统一返回行为）
        if (modal) {
            modal.on('show.bs.modal', resetToMain);
        }
    }

    /* ---------- 初始化 ---------- */
    function init() {
        modal = $('exampleModalGaming') ? window.jQuery ? window.jQuery('#exampleModalGaming') : null : null;
        els = {
            body: document.querySelector('#exampleModalGaming .af-body'),
            searchInput: $('af-search-input'),
            recommendGrid: $('af-recommend-grid'),
            methods: document.querySelector('#exampleModalGaming .af-methods'),
            empty: $('af-empty'),
            detailContent: $('af-detail-content'),
            backBtn: document.querySelector('#af-view-detail .af-back'),
            primaryBtn: $('af-primary-btn'),
            resultSub: $('af-result-sub'),
            doneBtn: $('af-done-btn')
        };
        renderRecommend('');
        bindEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
