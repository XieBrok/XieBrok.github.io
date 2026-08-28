/* ==========================================================================
 * 添加好友中心交互逻辑（js/add-friend.js）
 * --------------------------------------------------------------------------
 * 导航模型：弹窗内视图栈（main → detail → result）
 *   - 主列表(af-view-main)：搜索框 + 推荐卡（Steam / Xbox）
 *                            + Minecraft 原始图片展示（不可点击、无样式化）
 *   - 详情(af-view-detail)：好友详情 + 主操作按钮
 *   - 结果(af-view-result)：添加结果提示
 * 跳转规则：
 *   - 推荐卡 → 详情（push）；详情 / 结果 → 返回列表（pop）
 *   - 外部平台类(link)：主按钮跳转平台（防重复），随后进入结果视图
 *   - Minecraft 图片：仅原图展示，不设任何按钮 / 图标 / 可点击元素
 * 异常处理：
 *   - 搜索无结果 → 空态提示（af-empty）
 *   - 数据缺失 → 详情兜底"无法打开"，返回列表
 *   - modal 关闭/重开 → 视图栈与搜索状态重置
 * ========================================================================== */
(function () {
    'use strict';

    /* ---------- 数据（静态站内置；仅保留主方式） ---------- */
    var RECOMMEND = [
        {
            key: 'steam',
            name: 'hichina',
            platform: 'Steam',
            desc: { zh: 'Steam 个人主页，添加后一起联机', en: 'Steam profile — add to play together' },
            icon: '/logo/steam.jpg',
            url: 'https://steamcommunity.com/id/hichina/'
        },
        {
            key: 'xbox',
            name: 'hichina5833',
            platform: 'Xbox',
            desc: { zh: 'Xbox 玩家代号，主机端联机', en: 'Xbox Gamertag — crossplay ready' },
            icon: '/logo/xbox.jpg',
            url: 'https://www.xbox.com/play/user/hichina5833'
        }
    ];

    /* Minecraft：按原始图片展示，不做任何替换/缩放/裁剪/风格化，
       不加按钮、图标或可点击元素 */
    var MC_INFO = {
        name: 'Minecraft',
        platform: 'Minecraft',
        icon: '/images/Minecraft_IDCARD.webp',
        searchText: 'minecraft 我的世界 mc'
    };

    /* ---------- 状态 ---------- */
    var stack = ['main'];      // 视图栈：当前视图在栈顶
    var jumping = false;       // 跳转防重锁

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
        var input = els.searchInput;
        if (input) {
            input.value = '';
        }
        showView('main');
        renderRecommend('');
    }

    function closeModal() {
        if (modal && typeof modal.modal === 'function') {
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

        // 1) 可点击的推荐卡（Steam / Xbox）
        RECOMMEND.forEach(function (f) {
            var hay = (f.name + ' ' + f.platform + ' ' + f.desc.zh + ' ' + f.desc.en).toLowerCase();
            if (q && hay.indexOf(q) === -1) {
                return;
            }
            shown++;
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'af-card';
            card.setAttribute('data-view-target', 'detail');
            card.setAttribute('data-friend', f.key);

            var avatar = document.createElement('img');
            avatar.className = 'af-card__avatar';
            avatar.src = f.icon;
            avatar.alt = f.platform;
            avatar.loading = 'lazy';

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

        // 2) Minecraft 原始图片（不可点击、无任何样式化处理）
        var mcHay = MC_INFO.searchText;
        if (!q || mcHay.indexOf(q) !== -1) {
            var mcWrap = document.createElement('div');
            mcWrap.className = 'af-mc';

            var mcName = document.createElement('p');
            mcName.className = 'af-mc__name';
            mcName.textContent = MC_INFO.platform;

            var mcImg = document.createElement('img');
            mcImg.className = 'af-mc__img';
            mcImg.src = MC_INFO.icon;
            mcImg.alt = MC_INFO.platform + ' ID 卡（原始图片）';
            mcImg.loading = 'lazy';
            mcImg.draggable = false;

            mcWrap.appendChild(mcName);
            mcWrap.appendChild(mcImg);
            grid.appendChild(mcWrap);
            shown++;
        }

        // 空态：无匹配结果
        var empty = els.empty;
        if (empty) {
            empty.hidden = shown > 0;
        }
        var titles = document.querySelectorAll('.af-section-title');
        titles.forEach(function (t) { t.style.display = shown > 0 ? '' : 'none'; });
    }

    /** 渲染详情视图 */
    function renderDetail(key) {
        var content = els.detailContent;
        if (!content) return;
        var zh = isZh();
        content.innerHTML = '';

        var f = null;
        RECOMMEND.forEach(function (item) {
            if (item.key === key) f = item;
        });

        if (!f) {
            // 异常兜底：数据缺失
            var err = document.createElement('div');
            err.className = 'af-fail';
            err.textContent = zh ? '无法打开该好友' : 'Unable to open';
            content.appendChild(err);
            setPrimaryAction(zh ? '返回列表' : 'Back', function () { goBack(); });
            return;
        }

        var avatar = document.createElement('img');
        avatar.className = 'af-detail__avatar';
        avatar.src = f.icon;
        avatar.alt = f.platform;
        avatar.loading = 'lazy';
        content.appendChild(avatar);

        var name = document.createElement('p');
        name.className = 'af-detail__name';
        name.textContent = f.name + ' · ' + f.platform;
        content.appendChild(name);

        var desc = document.createElement('p');
        desc.className = 'af-detail__desc';
        desc.textContent = f.desc[zh ? 'zh' : 'en'];
        content.appendChild(desc);

        // 主操作：跳转外部平台（防重复跳转）
        setPrimaryAction(zh ? '打开平台添加' : 'Open platform', function () {
            if (jumping) return;
            jumping = true;
            if (f.url) {
                window.open(f.url, '_blank', 'noopener');
            }
            showResult(zh ? '已打开平台页面，请在平台内完成添加' : 'Platform opened — complete the request there');
        });
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
        // 事件委托：推荐卡 → 详情
        var body = els.body;
        if (body) {
            body.addEventListener('click', function (e) {
                var target = e.target.closest ? e.target.closest('[data-view-target]') : null;
                if (!target) return;
                var key = target.getAttribute('data-friend');
                renderDetail(key);
                pushView('detail');
            });
        }

        // 返回按钮
        var back = els.backBtn;
        if (back) {
            back.addEventListener('click', goBack);
        }

        // 主操作按钮
        var primary = els.primaryBtn;
        if (primary) {
            primary.addEventListener('click', function () {
                if (typeof primary._handler === 'function') {
                    primary._handler();
                }
            });
        }

        // 完成按钮：关闭弹窗
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
        modal = window.jQuery ? window.jQuery('#exampleModalGaming') : null;
        els = {
            body: document.querySelector('#exampleModalGaming .af-body'),
            searchInput: $('af-search-input'),
            recommendGrid: $('af-recommend-grid'),
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
