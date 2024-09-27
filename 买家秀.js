/**
 * @author YG
 * @name 买家秀
 * @team YG
 * @version 1.0.0
 * @description 随机获取一张图片，并获取来源网址中的所有图片（排除第一张），发送剩余图片
 * @rule ^买家秀$
 * @admin true
 */

const request = require('request');
const cheerio = require('cheerio');

module.exports = async s => {
    if (!(await s.isAdmin())) {
        await s.reply('你没有权限使用这个命令。');
        return;
    }

    const baseUrl = 'https://www.ikmjx.com/?order=rand';  // 目标网站 URL

    try {
        // 获取随机图片，排除前五张图片
        const imageInfo = await fetchRandomImageInfo(baseUrl);
        if (!imageInfo) {
            await s.reply('未能获取到图片，请稍后再试。');
            return;
        }

        // 发送随机图片
        await s.reply({
            type: 'image',
            path: imageInfo.src
        });

        // 打开图片来源网址，获取并发送剩余图片（排除第一张）
        const allImages = await fetchAllImagesFromPage(imageInfo.link);
        if (allImages.length === 0) {
            await s.reply('未能获取到来源网址中的图片，请稍后再试。');
            return;
        }

        // 排除第一张图片
        const remainingImages = allImages.slice(1);
        for (const image of remainingImages) {
            if (image) {  // 确保图片路径有效
                await s.reply({
                    type: 'image',
                    path: image
                });
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

            // 获取所有图片信息，包括URL和来源链接
            $('img').each((index, element) => {
                const src = $(element).attr('src');
                const link = $(element).closest('a').attr('href');
                if (src && link && index >= 5) {  // 跳过前五张图片
                    images.push({ src, link });
                }
            });

            if (images.length === 0) {
                return resolve(null);
            }

            // 随机选择一张图片
            const randomImage = images[Math.floor(Math.random() * images.length)];
            resolve(randomImage);
        });
    });
}

async function fetchAllImagesFromPage(url) {
    // 确保 URL 是完整的
    if (!url.startsWith('http')) {
        url = `https://www.ikmjx.com${url}`;
    }

    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                return reject(error);
            }

            const $ = cheerio.load(body);
            const images = [];

            // 获取所有图片URL
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
