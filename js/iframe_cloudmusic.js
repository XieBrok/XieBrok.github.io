document.getElementById('toggle-iframe').addEventListener('click', function () {
    const iframeWrapper = document.getElementById('iframe-wrapper');
    if (iframeWrapper.style.display === 'none' || iframeWrapper.style.display === '') {
        iframeWrapper.style.display = 'block'; // 显示 iframe
    } else {
        iframeWrapper.style.display = 'none'; // 隐藏 iframe
    }
});