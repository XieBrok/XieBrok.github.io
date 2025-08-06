const translations = {
    en: {
        Comment:"Comment",
        来这里留下你想说的话吧:"Feel free to leave what you want to say here!",
    },
    zh: {
        Comment:"留言板",
        来这里留下你想说的话吧:"来这里留下你想说的话吧",
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
