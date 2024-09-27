/**
 * @author YG
 * @name 下厨房
 * @team YG
 * @version 1.0.0
 * @description 查询下厨房菜谱
 * @rule ^(.+怎么做)$
 * @admin true
 */

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async sender => {
    const keyword = sender.param(1).replace('怎么做', '').trim();
    const url = `https://www.xiachufang.com/search/?keyword=${encodeURIComponent(keyword)}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const firstResult = $('.normal-recipe-list li').first();
        const recipeLink = firstResult.find('a').attr('href');
        const recipeTitle = firstResult.find('.name').text().trim();
        const recipeUrl = `https://www.xiachufang.com${recipeLink}`;

        const recipePage = await axios.get(recipeUrl);
        const $$ = cheerio.load(recipePage.data);
        const recipeImg = $$('div.cover img').attr('src');
        const ingredients = $$('.ings li').map((i, el) => $(el).text().trim()).get().join('\n');
        const steps = $$('.steps li').map((i, el) => $$(el).text().trim()).get().join('\n\n');

        const message = `
【${recipeTitle}】
原料：
${ingredients}

步骤：
${steps}

更多详情请访问：${recipeUrl}
`;

        await sender.reply({
            type: 'text',
            msg: message
        });

        if (recipeImg) {
            await sender.reply({
                type: 'image',
                path: recipeImg
            });
        }
    } catch (error) {
        console.error(error);
        await sender.reply('无法获取该菜谱的信息，请稍后再试。');
    }
};
