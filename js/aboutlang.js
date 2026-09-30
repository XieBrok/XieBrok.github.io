const translations = {
    en: {
        aboutTitle: "About Me",
        aboutHello: "Hi, I'm HHYYYY",
        aboutTagline: "Photography · Technology · Gaming",
        aboutP1: "I shoot cultural and natural scenes with a Nikon Z30 — a fleeting moment on the street, light falling across the hills. My photos go to Synology Photos; you're welcome to take a look.",
        aboutP2: "I tinker with Raspberry Pi 3b+ and HomeAssistant, and I'm learning front-end development — this site is my practice ground. I'm also a member of TATEN, a computer science communication team.",
        aboutP3: "Gaming is another way of seeing the world. Lately I've been playing Forza Horizon 4, Death Stranding and Minecraft — feel free to add me.",
        aboutP4: "My motto is INFINITY PROGRESS — keep the passion, head for the mountains and the sea.",
        aboutInterestsTitle: "Interests",
        aboutTagPhoto: "Photography",
        aboutTagPi: "Raspberry Pi",
        aboutTagHA: "HomeAssistant",
        aboutTagFrontend: "Front-end development",
        aboutTagGaming: "Gaming",
        aboutFindMeTitle: "Find Me",
        aboutLinkComment: "Comment",
        aboutLinkPhotos: "Synology Photos",
        aboutLinkBili: "Watch the video",
    },
    zh: {
        aboutTitle: "自我介绍",
        aboutHello: "你好，我是 HHYYYY",
        aboutTagline: "摄影 · 技术 · 游戏",
        aboutP1: "我带着尼康 Z30 记录身边的文化与自然——街头的一瞬、山野的光影，都是我按下快门的原因。作品会同步到我的 Synology Photos，欢迎去看看。",
        aboutP2: "平时我折腾树莓派 3b+ 和 HomeAssistant，也在学习前端开发，这个网站就是我的练习场；此外我还是 TATEN 的一员，一个计算机科学交流团队。",
        aboutP3: "游戏是另一种看世界的方式。最近在玩《极限竞速：地平线4》《死亡搁浅》和《我的世界》，欢迎来加好友一起玩。",
        aboutP4: "我的信条是「无限进步」——保持热爱，奔赴山海。",
        aboutInterestsTitle: "兴趣",
        aboutTagPhoto: "摄影",
        aboutTagPi: "树莓派",
        aboutTagHA: "HomeAssistant",
        aboutTagFrontend: "前端开发",
        aboutTagGaming: "游戏",
        aboutFindMeTitle: "找到我",
        aboutLinkComment: "留言板",
        aboutLinkPhotos: "Synology Photos",
        aboutLinkBili: "影视飓风活动视频",
    }
};

// 切换语言的函数和动画
function switchLanguage(lang) {
    // 通知不依赖 data-lang-key 的组件（如主题切换按钮）更新文案
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));

    document.querySelectorAll("[data-lang-key]").forEach((element) => {
        const key = element.getAttribute("data-lang-key");
        if (translations[lang][key]) {
            // Add fade-out animation
            element.classList.add("fade-out");
            setTimeout(() => {
                // Update content after fade-out
                if (element.tagName === "A") {
                    element.textContent = translations[lang][key];
                } else if (element.querySelector("a")) {
                    const link = element.querySelector("a");
                    link.textContent = translations[lang][key];
                } else {
                    element.innerHTML = translations[lang][key];
                }
                // Add fade-in animation
                element.classList.remove("fade-out");
                element.classList.add("fade-in");
                setTimeout(() => {
                    element.classList.remove("fade-in");
                }, 500); // Remove fade-in class after animation
            }, 500); // Wait for fade-out animation to complete
        }
    });
}

// 获取语言并自动切换与按钮的监听
document.addEventListener("DOMContentLoaded", () => {
    const browserLanguage = navigator.language || navigator.userLanguage;

    if (browserLanguage.startsWith("zh")) {
        switchLanguage("zh");
    } else {
        switchLanguage("en");
    }

    // 页面中存在语言按钮时才绑定（修复原实现因元素缺失抛 TypeError 的问题）
    const btnEn = document.getElementById("switch-to-en");
    const btnZh = document.getElementById("switch-to-zh");
    if (btnEn) {
        btnEn.addEventListener("click", () => switchLanguage("en"));
    }
    if (btnZh) {
        btnZh.addEventListener("click", () => switchLanguage("zh"));
    }
});
