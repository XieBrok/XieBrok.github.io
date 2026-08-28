// 标题打字特效（修复：打字前先清空，使无 JS 时静态文本仍可显示；
// 移除对不存在的 #typing-end2 的引用，避免 null 报错）
document.addEventListener("DOMContentLoaded", function () {
    var typingTitle = document.getElementById("typing-title");
    if (!typingTitle) {
        return;
    }
    var text = "Hi I'm HHYYYY<br>PHOTOGRAPH TECHNOLOGY GAMING.";
    var index = 0;
    typingTitle.innerHTML = ""; // 清空静态内容，开始打字（无 JS 时保留静态文本）

    function type() {
        if (index < text.length) {
            if (text.charAt(index) === '<') {
                var brTag = text.substring(index, index + 4);
                if (brTag === '<br>') {
                    typingTitle.innerHTML += '<br>';
                    index += 4;
                }
            } else {
                typingTitle.innerHTML += text.charAt(index);
                index++;
            }
            setTimeout(type, 150);
        }
    }

    type();
});

// 页脚打字特效
document.addEventListener("DOMContentLoaded", function () {
    var typingEnd = document.getElementById("typing-end");
    if (!typingEnd) {
        return;
    }
    var text = "INFINITY PROGRESS.";
    var index = 0;
    typingEnd.innerHTML = ""; // 清空静态内容，开始打字

    function type() {
        if (index < text.length) {
            if (text.charAt(index) === '<') {
                var brTag = text.substring(index, index + 4);
                if (brTag === '<br>') {
                    typingEnd.innerHTML += '<br>';
                    index += 4;
                }
            } else {
                typingEnd.innerHTML += text.charAt(index);
                index++;
            }
            setTimeout(type, 150);
        }
    }

    type();
});
