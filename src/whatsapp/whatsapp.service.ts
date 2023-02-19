import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { OpenaiService } from '../openai/openai.service';
import QrTerminal = require('qrcode-terminal');
@Injectable()
export class WhatsappService implements OnModuleInit {
  constructor(private openaiService: OpenaiService) {}
  onModuleInit() {
    console.log(`Initialization...`);
    this.botMessage();
  }
  botMessage() {
    const client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ['--no-sandbox'],
      },
    });
    client.initialize();

    client.on('loading_screen', (percent, message) => {
      console.log('LOADING SCREEN', percent, message);
    });

    client.on('qr', (qr) => {
      // NOTE: This event will not be fired if a session is specified.
      QrTerminal.generate(qr, { small: true });
      console.log('QR RECEIVED', qr);

      console.log('after qr');
    });

    client.on('authenticated', () => {
      console.log('AUTHENTICATED');
    });

    client.on('auth_failure', (msg) => {
      // Fired if session restore was unsuccessful
      console.error('AUTHENTICATION FAILURE', msg);
    });

    client.on('ready', () => {
      console.log('READY');
    });

    client.on('message', async (msg) => {
      console.log('MESSAGE RECEIVED', msg);

      if (msg.body === '!ping reply') {
        // Send a new message as a reply to the current one
        msg.reply('pong');
      } else if (msg.body === '!ping') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'pong');
      } else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        let number = msg.body.split(' ')[1];
        const messageIndex = msg.body.indexOf(number) + number.length;
        const message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        const chat = await msg.getChat();
        chat.sendSeen();
        client.sendMessage(number, message);
      } else if (msg.body.startsWith('!subject ')) {
        // Change the group subject
        const chat = await msg.getChat();
        if (chat.isGroup) {
          const newSubject = msg.body.slice(9);
          chat.sendMessage(newSubject);
        } else {
          msg.reply('This command can only be used in a group!');
        }
      } else if (msg.body.startsWith('!chat ')) {
        // Replies with the same message
        const answer = await this.openaiService.getAnswer(msg.body.slice(6));
        msg.reply(answer);
      } else if (msg.body.startsWith('!desc ')) {
        // Change the group description
        const chat = await msg.getChat();
        if (chat.isGroup) {
          const newDescription = msg.body.slice(6);
          chat.sendMessage(newDescription);
        } else {
          msg.reply('This command can only be used in a group!');
        }
      }
    });
    client.on('disconnected', (reason) => {
      console.log('Client was logged out', reason);
    });
  }
}
