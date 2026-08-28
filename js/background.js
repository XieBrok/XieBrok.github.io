/* 粒子背景（particles.js）
 * 颜色跟随系统主题（prefers-color-scheme）：
 *   - 浅色：浅灰背景 + 深灰粒子
 *   - 深色：深黑背景 + 浅灰粒子
 * 系统主题切换时重建粒子以应用新配色（容器背景色由 CSS 变量 var(--bg) 控制）。
 */
(function () {
    'use strict';

    var themeQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

    function themeColors() {
        var dark = themeQuery ? themeQuery.matches : false;
        return dark
            ? { particle: '#cccccc', line: '#cccccc' }
            : { particle: '#556071', line: '#556071' };
    }

    function initParticles() {
        if (typeof particlesJS !== 'function') {
            return;
        }
        var c = themeColors();
        var el = document.getElementById('particles-js');
        if (el) {
            el.innerHTML = ''; // 清除旧 canvas，避免重复实例
        }
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 100,
                    density: { enable: true, value_area: 800 }
                },
                color: { value: c.particle },
                shape: {
                    type: 'circle',
                    stroke: { width: 0, color: '#000000' }
                },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: c.line,
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }

    initParticles();

    // 系统深浅色切换 → 重建粒子配色
    if (themeQuery && typeof themeQuery.addEventListener === 'function') {
        themeQuery.addEventListener('change', initParticles);
    }
})();
