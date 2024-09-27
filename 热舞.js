/**
 * @author YG
 * @name 热舞
 * @team YG
 * @version 1.0.0
 * @description 随机返回一个跳舞的小姐姐视频
 * @rule ^(热舞|rw)$
 * @admin true
 */

const got = require('got');

module.exports = async s => {
    if (!(await s.isAdmin())) {
        await s.reply('你没有权限使用这个命令。');
        return;
    }

    const apiUrl = 'https://api.kuleu.com/api/xjj?type=json';
    console.log('请求 URL:', apiUrl);

    try {
        // 获取视频数据
        const response = await got(apiUrl, { responseType: 'json' });
        const data = response.body;

        // 输出 API 返回的数据用于调试
        console.log('API 返回的数据:', data);

        if (data.code === 200 && data.video) {
            const videoUrl = data.video;
            console.log('视频 URL:', videoUrl);

            await s.reply({
                type: 'video',
                path: videoUrl,
                msg: '跳舞小姐姐来啦~',
            });
        } else {
            await s.reply('未能获取到视频，请稍后再试。');
        }
    } catch (error) {
        console.error('发送视频时发生错误:', error);
        await s.reply('未能获取到视频，请稍后再试。');
    }
};
