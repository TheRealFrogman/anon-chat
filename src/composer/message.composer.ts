import { Composer, Telegraf } from "telegraf";
import { roomService } from "../service/room.service";
import { messageCoupler } from "../service/message-coupler.service";

export const messageComposer = new Composer()
   .url(/.*/, Telegraf.reply("Ссылки запрещены"))
   .on("message", async (ctx) => {
      const room = roomService.findOneByUser(ctx.from); // find room by user id
      if (room) { // if present 
         const anotherUser = room.getAnotherChatter(ctx.from); // get destination user
         const { message_id: destMessageId } = await ctx.copyMessage(anotherUser.id); // send message to dest user
         const originMessageId = ctx.message.message_id;

         messageCoupler.add(room.id, [destMessageId, originMessageId]);
      } else {  // if not
         await ctx.reply("Найдите собеседника"); // tell user to find a room
      }
   })
   .on("edited_message", async (ctx) => {
      const room = roomService.findOneByUser(ctx.from); // find room by user id
      if (!room) return;
      const anotherUser = room.getAnotherChatter(ctx.from);

      const anotherMessageId = messageCoupler.getAnotherMessageId(room.id, ctx.editedMessage.message_id);
      if (!anotherMessageId) return;

      if ('caption' in ctx.editedMessage) {
         ctx.telegram.editMessageCaption(anotherUser.id, anotherMessageId, '', ctx.editedMessage.caption);
      } else if ('text' in ctx.editedMessage && ctx.editedMessage.text) {
         ctx.telegram.editMessageText(anotherUser.id, anotherMessageId, '', ctx.editedMessage.text)
      };
   })