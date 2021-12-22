const rp = require('request-promise');
const cheerio = require('cheerio');
const { IncomingWebhook } = require('@slack/webhook');

const sleepTime = 1000;
const infoModulus = 20;

const url = 'https://www.patreon.com/cryptogorilla/membership';
const selector = 'a[data-tag="patron-checkout-continue-button"]';
const webhookUrl = '';

const webhook = new IncomingWebhook(webhookUrl);

const sendMessage = async () => {
    await webhook.send({
        // text: "I've got news for you...",
        attachments: [
            {
                title: 'Cryptogorilla is now available!',
                title_link: 'https://www.patreon.com/cryptogorilla',
                text: 'Click the button below to get started.',
                color: '#7CD197',
                callback_id: 'patreon_checkout',
                actions: [
                    {
                        name: 'patreon_checkout',
                        text: 'Checkout',
                        type: 'button',
                        value: 'checkout',
                        url: 'https://www.patreon.com/cryptogorilla/membership',
                    },
                ],
            },
        ],
    });
};

const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const checkWebsite = async () => {
    const html = await rp(url);

    const $ = cheerio.load(html);

    const buttonHtml = $(selector).html();
    const buttonText = $(selector).text();
    if (buttonText === 'Sold Out') {
        process.stdout.write('.');
    } else if (buttonHtml === null) {
        process.stdout.write('_');
    } else {
        console.log('Something new!');
        await sendMessage();
    }
};

const runUntilStopped = async () => {
    console.log('scraper-checker started\n');
    let checkCount = 0;
    while (true) {
        checkCount++;

        try {
            await checkWebsite();
        } catch (error) {
            console.error(error.message);
        }

        if (checkCount % infoModulus === 0) {
            console.log(`\nStill running, checked ${checkCount} times\n`);
        }

        await sleep(sleepTime);
    }
};

runUntilStopped();

// for testing:
// sendMessage();
