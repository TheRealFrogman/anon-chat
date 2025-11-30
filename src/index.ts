import { Telegraf } from 'telegraf'

import { interestComposer } from './composer/interests.composer';
import { chatControlsComposer } from './composer/chat-controls.composer';
import { messageComposer } from './composer/message.composer';

// for json dbs to work
import fsp from 'node:fs/promises'
import path from 'node:path'
fsp.mkdir(path.resolve(process.cwd(), "./db"), { recursive: true })
process.loadEnvFile(__dirname + "/../.env");

const app = new Telegraf(process.env["TOKEN"]!);

app.use(async (ctx, next) => {
   try {
      await next();
   } catch (error) {
      throw error;
   }
})

app.use(chatControlsComposer)
app.use(interestComposer)
app.use(messageComposer);

app.launch({
   allowedUpdates: ['message', 'callback_query', 'edited_message'],
   dropPendingUpdates: true,
}, () => {
   console.log("app started");
});
