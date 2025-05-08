// 标题打字特效的 JavaScript 代码
document.addEventListener("DOMContentLoaded", function () {
    const text = "Hi I'm HHYYYY<br>PHOTOGRAPH TECHNOLOGY GAMING."; // 要显示的文字，使用 <br> 换行
    const typingTitle = document.getElementById("typing-title");
    let index = 0;

    function type() {
        if (index < text.length) {
            // 检查是否是换行符
            if (text.charAt(index) === '<') {
                const brTag = text.substring(index, index + 4); // 获取 <br>
                if (brTag === '<br>') {
                    typingTitle.innerHTML += '<br>';
                    index += 4; // 跳过 <br> 的长度
                }
            } else {
                typingTitle.innerHTML += text.charAt(index);
                index++;
            }
            setTimeout(type, 150); // 每个字符间隔 150 毫秒
        }
    }

    type();
});

// 页脚的打字特效
    document.addEventListener("DOMContentLoaded", function () {
        const text = "INFINITY PROGRESS."; // 要显示的文字，使用 <br> 换行
        const typingTitle = document.getElementById("typing-end");
        let index = 0;

        function type() {
            if (index < text.length) {
                // 检查是否是换行符
                if (text.charAt(index) === '<') {
                    const brTag = text.substring(index, index + 4); // 获取 <br>
                    if (brTag === '<br>') {
                        typingTitle.innerHTML += '<br>';
                        index += 4; // 跳过 <br> 的长度
                    }
                } else {
                    typingTitle.innerHTML += text.charAt(index);
                    index++;
                }
                setTimeout(type, 150); // 每个字符间隔 150 毫秒
            }
        }

        type();
    });
            document.addEventListener("DOMContentLoaded", function () {
                const text = "不要错过重要的事."; // 要显示的文字，使用 <br> 换行
                const typingTitle = document.getElementById("typing-end2");
                let index = 0;
        
                function type() {
                    if (index < text.length) {
                        // 检查是否是换行符
                        if (text.charAt(index) === '<') {
                            const brTag = text.substring(index, index + 4); // 获取 <br>
                            if (brTag === '<br>') {
                                typingTitle.innerHTML += '<br>';
                                index += 4; // 跳过 <br> 的长度
                            }
                        } else {
                            typingTitle.innerHTML += text.charAt(index);
                            index++;
                        }
                        setTimeout(type, 150); // 每个字符间隔 150 毫秒
                    }
                }
        
                type();
            });
 //页脚的打字特效