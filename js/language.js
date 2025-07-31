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
        highlights: "HIGHLIGHTS",
        hitext: "The activity of MediaStorm<br>'To you, a thousand years from now.'",
        linktobili: "Watch the video",       
        studyWithMiku: "STUDY With MIKU",
        forkedFrom: "Forked From wenqi",
        footerText: "INFINITY PROGRESS.",
        footerText2: "Don't miss important things.",
        thanks: "Thanks to the following outstanding open-source projects ",
        ComputerScienceCommunicationTeam: "Computer Science Communication Team",
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
        playing: "我正在玩 <br> 极限竞速：地平线4 <br> 死亡搁浅 <br> 我的世界.",
        addFriends: "添加好友",
        findmeon: "在这里找到我",
        tools: "工具",
        highlights: "高光时刻",
        hitext: "影视飓风的活动<br>'致千年之后的你.'",
        linktobili: "观看视频",
        studyWithMiku: "STUDY With MIKU",
        forkedFrom: "Forked From wenqi",
        footerText: "无限进步.",
        footerText2: "不要错过重要的事.",
        thanks: "感谢以下杰出的开源项目 ",
        ComputerScienceCommunicationTeam: "计算机科学交流团队",
    }
};

// 切换语言的函数和动画
function switchLanguage(lang) {
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
    console.log(`Detected browser language: ${browserLanguage}`);

    if (browserLanguage.startsWith("zh")) {
        switchLanguage("zh");
    } else {
        switchLanguage("en");
    }

    document.getElementById("switch-to-en").addEventListener("click", () => switchLanguage("en"));
    document.getElementById("switch-to-zh").addEventListener("click", () => switchLanguage("zh"));
});
