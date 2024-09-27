/**
 * @author YG
 * @name 黑丝
 * @team YG
 * @version 1.0.1
 * @description 随机返回一个黑丝视频
 * @rule ^(黑丝|heisis)$
 * @admin true
 */

const request = require('request');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');

module.exports = async s => {
    if (!(await s.isAdmin())) {
        await s.reply('你没有权限使用这个命令。');
        return;
    }

    let url = 'http://api.yujn.cn/api/heisis.php';
    console.log('请求 URL:', url);

    try {
        const videoPath = await downloadVideo(url);
        await s.reply({
            type: 'video',
            path: videoPath,
            msg: '黑丝小姐姐来啦~',
        });
        fs.unlinkSync(videoPath); // 删除临时文件
    } catch (error) {
        console.error('发送视频时发生错误:', error);
        await s.reply('未能获取到视频，请稍后再试。');
    }
};

async function downloadVideo(url) {
    const filePath = path.join(process.cwd(), `BncrData/public/${randomUUID().split('-').join('')}.mp4`);
    return new Promise((resolve, reject) => {
        const stream = request(url).pipe(fs.createWriteStream(filePath));
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}
