/**
 * @author YG
 * @name 随机图片
 * @team YG
 * @version 1.0.1
 * @description 随机获取并发送一张指定主题的图片，并继续发送来源网址中的所有图片（每次10张）
 * @rule ^随机图片$
 * @admin true
 */

const request = require('request');
const cheerio = require('cheerio');

module.exports = async s => {
    if (!(await s.isAdmin())) {
        await s.reply('你没有权限使用这个命令。');
        return;
    }

    const url = 'https://www.ikanins.com/';  // 目标网站 URL
    const maxImagesPerPage = 10;
    let allImages = [];
    let currentIndex = 0;
    let continueCount = 0;

    try {
        const { src: randomImage, link } = await fetchRandomImageInfo(url);
        if (!randomImage) {
            await s.reply('未能获取到图片，请稍后再试。');
            return;
        }

        // 发送随机选择的图片
        await s.reply({
            type: 'image',
            path: randomImage
        });

        // 获取并处理来源网址中的所有图片
        allImages = await fetchImagesFromPage(link);
        if (allImages.length === 0) {
            await s.reply('未能获取到来源页面中的图片，请稍后再试。');
            return;
        }

        // 发送图片，按10张一组
        while (currentIndex < allImages.length) {
            const imagesToSend = allImages.slice(currentIndex, currentIndex + maxImagesPerPage);
            await sendImages(s, imagesToSend);

            currentIndex += maxImagesPerPage;

            if (currentIndex < allImages.length) {
                const reply = await s.reply("是否继续返回剩余图片，回复Y继续，回复N取消，回复YYY发送全部");
                const input = await s.waitInput(() => {}, 30);
                if (!input) {
                    await s.reply("操作超时或取消，已退出。");
                    return;
                }
                const content = input.getMsg().toUpperCase();
                if (content === 'YYY') {
                    await sendImages(s, allImages.slice(currentIndex));
                    return;
                } else if (content !== 'Y') {
                    return s.reply('已取消发送');
                }
                continueCount++;
                if (continueCount >= 3) {
                    continueCount = 0;  // 重置计数器
                }
            }
        }
    } catch (error) {
        console.error('发送图片时发生错误:', error);
        await s.reply('未能获取到图片，请稍后再试。');
    }
};

async function fetchRandomImageInfo(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                return reject(error);
            }

            const $ = cheerio.load(body);
            const images = [];

            $('img').each((index, element) => {
                const src = $(element).attr('src');
                const link = $(element).closest('a').attr('href');
                if (src && link) {
                    images.push({ src, link });
                }
            });

            if (images.length === 0) {
                return resolve(null);
            }

            const randomImage = images[Math.floor(Math.random() * images.length)];
            resolve(randomImage);
        });
    });
}

async function fetchImagesFromPage(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                return reject(error);
            }

            const $ = cheerio.load(body);
            const images = [];

            $('img').each((index, element) => {
                const src = $(element).attr('src');
                if (src) {
                    images.push(src);
                }
            });

            resolve(images);
        });
    });
}

async function sendImages(s, images) {
    for (const image of images) {
        await s.reply({
            type: 'image',
            path: image
        });
    }
}
