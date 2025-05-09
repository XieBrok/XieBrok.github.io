const translations = {
    en: {
        title: "Hi I'm HHYYYY<br>PHOTOGRAPH TECHNOLOGY GAMING.",
        photograph: "PHOTOGRAPH",
        culturalNature: "CULTURAL <br> & <br> NATURE.",
        worksWith: "Works With Nikon Z30",
        goToPhotos: "Go To Synology Photos",
        technology: "TECHNOLOGY",
        learning: "Learning <br> Raspberry Pi 3b+ <br> HomeAssistant <br> Front-end development.",
        goToGithub: "Go To My Github",
        gaming: "GAMING",
        playing: "I'm playing <br> Forza Horizon 4 <br> Death Stranding <br> Minecraft.",
        addFriends: "Add Friends",
        findmeon: "Find Me On",
        tools: "Tools",
        studyWithMiku: "STUDY With MIKU",
        forkedFrom: "Forked From wenqi",
        footerText: "INFINITY PROGRESS.",
        footerText2: "Don't miss important things."
    },
    zh: {
        title: "你好，我是 HHYYYY<br>摄影 技术 游戏.",
        photograph: "摄影",
        culturalNature: "文化 <br> & <br> 自然.",
        worksWith: "使用尼康 Z30 拍摄",
        goToPhotos: "转到 Synology Photos",
        technology: "技术",
        learning: "正在学习 <br> 树莓派 3b+ <br> HomeAssistant <br> 前端开发.",
        goToGithub: "访问我的 Github",
        gaming: "游戏",
        playing: "我正在玩 <br> 极限竞速 4 <br> 死亡搁浅 <br> 我的世界.",
        addFriends: "添加好友",
        findmeon: "在这里找到我",
        tools: "工具",
        studyWithMiku: "STUDY With MIKU",
        forkedFrom: "Forked From wenqi",
        footerText: "无限进步.",
        footerText2: "不要错过重要的事."
    }
};


// Function to switch language
function switchLanguage(lang) {
    console.log(`Switching to language: ${lang}`);
    document.querySelectorAll("[data-lang-key]").forEach((element) => {
        const key = element.getAttribute("data-lang-key");
        console.log(`Updating key: ${key}`);
        if (translations[lang][key]) {
            if (element.tagName === "A") {
                // 如果是超链接，只更新文本内容，不覆盖 href
                element.textContent = translations[lang][key];
            } else if (element.querySelector("a")) {
                // 如果元素内部包含超链接，只更新超链接的文本
                const link = element.querySelector("a");
                link.textContent = translations[lang][key];
            } else {
                // 更新其他元素的内容
                element.innerHTML = translations[lang][key];
            }
            console.log(`Updated ${key} to: ${translations[lang][key]}`);
        }
    });
}


//获取语言并自动切换与按钮的监听
document.addEventListener("DOMContentLoaded", () => {
    // 获取浏览器语言
    const browserLanguage = navigator.language || navigator.userLanguage;
    console.log(`Detected browser language: ${browserLanguage}`);

    // 根据浏览器语言设置默认语言
    if (browserLanguage.startsWith("zh")) {
        switchLanguage("zh"); // 如果是中文，切换到中文
    } else {
        switchLanguage("en"); // 默认切换到英文
    }

    // 添加语言切换按钮的事件监听
    document.getElementById("switch-to-en").addEventListener("click", () => switchLanguage("en"));
    document.getElementById("switch-to-zh").addEventListener("click", () => switchLanguage("zh"));
});