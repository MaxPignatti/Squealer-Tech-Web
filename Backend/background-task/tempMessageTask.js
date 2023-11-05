const schedule = require('node-schedule');
const Message = require('../models/message');
const fetch = require('node-fetch');

const checkAndSendTempMessages = () => {
  const job = schedule.scheduleJob('* * * * * *', async () => {
    try {
      // Find all messages with isTemp set to true
      const tempMessages = await Message.find({ isTemp: true });

      // Get the current timestamp
      const currentTime = new Date();

      // Loop through the temp messages and check if it's time to send them
      for (const message of tempMessages) {
        const createdAt = message.createdAt;
        const updateInterval = message.updateInterval;

        const nextSendTime = new Date(createdAt.getTime() + updateInterval * 60000);

        if (currentTime >= nextSendTime) {
          if (message.maxSendCount > 0) {
            console.log(`Sending message ID: ${message._id}`);
            const data = {
              userName: message.user,
              image: message.image,
              text: message.text,
              charCount: message.charCount,
              isTemp: true,
              updateInterval: message.updateInterval,
              maxSendCount: message.maxSendCount-1, 
            };

            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            };

            const response = await fetch('http://localhost:3500/create', requestOptions);

            if (response.status === 201) {
              const responseData = await response.json();

            } else {
              const errorData = await response.json();
              console.error('Error creating a message:', errorData.error);
            }
            message.createdAt=Date.now()
            message.isTemp=false;         
            await message.save();

            
          }else{
            message.isTemp = false;
            await message.save();
             
          }
        }
      }
    } catch (error) {
      console.error('Error checking and sending temp messages:', error);
    }
  });
};


module.exports = { checkAndSendTempMessages };
