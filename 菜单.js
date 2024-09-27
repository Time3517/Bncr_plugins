/**
 * @author YG
 * @name 自定义菜单
 * @team YG
 * @version 1.0.0
 * @description 当发送"菜单"指令时，机器人会回复预设的指令列表。
 * @rule ^菜单$
 * @admin true
 */

module.exports = async s => {
    // 检查是否是管理员
    if (!(await s.isAdmin())) {
        await s.reply('你没有权限使用这个命令。');
        return;
    }

    // 自定义菜单内容
    const menu = `
📋 **菜单列表**

上车: 登录狗东
热舞: 热舞视频
黑丝: 黑丝视频
美女: 美女视频
姐姐: 美女视频
丝袜: 丝袜美腿图片
写真: 唯美写真图片
街拍: 街拍偷拍图片
自拍: 网友自拍图片
欧美: 欧美风情图片
下厨房：XX怎么做?
买家秀: 随机买家秀图片
随机图片: 爱看INS随机图片
账密登录: 账密登录 手机号 密码

👉 请根据需要发送指令使用对应的功能。
    `;

    // 发送菜单
    await s.reply(menu);
};
