const axios = require('axios');
const FormData = require('form-data');

module.exports.config = {
    name: 'new',
    version: '1.0.3',
    hasPermission: 0,
    credits: 'Yan Maglinte',
    description: 'Free AI Chatbot!',
    usePrefix: false,
    commandCategory: 'chatbots',
    usages: 'Ai prompt!',
    cooldowns: 0,
};

module.exports.run = async function({ api, event, args }) {
    const prompt = args.join(' ');
    const credits = this.config.credits;

    if (!prompt) {
        return api.sendMessage('Hello 👋 How can I help you today?', event.threadID, event.messageID);
    }

    // Handle image attachments if the user replied to a message with an image
    if (event.type === 'message_reply' && event.messageReply.attachments) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === 'photo') {
            const image_url = attachment.url;

            try {
                // Download the image from the URL
                const response = await axios.get(image_url, { responseType: 'stream' });

                // Create FormData and append the image and prompt
                const form = new FormData();
                form.append('prompt', prompt);
                form.append('image', response.data, { filename: 'image.jpg' });

                // Make the POST request to your API
                const apiResponse = await axios.post('https://gemininewapi.onrender.com/api/process', form, {
                    headers: {
                        ...form.getHeaders(),
                    },
                });

                const data = apiResponse.data;
                const output = data.response;
                api.sendMessage(output, event.threadID, event.messageID);
            } catch (error) {
                console.error('Error:', error);
                api.sendMessage('⚠️ An error occurred!', event.threadID, event.messageID);
            }
            return;
        }
    }

    // Handle the case where only a prompt is provided without an image
    try {
        const form = new FormData();
        form.append('prompt', prompt);

        // Make the POST request to your API
        const apiResponse = await axios.post('https://gemininewapi.onrender.com/api/process', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        const data = apiResponse.data;
        const output = data.response;
        api.sendMessage(output, event.threadID, event.messageID);
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage('⚠️ An error occurred!', event.threadID, event.messageID);
    }
};
