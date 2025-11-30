import { Composer, Context } from "telegraf";
import { roomService } from "../service/room.service";
import { messageCoupler } from "../service/message-coupler.service";
import { Update, User } from "telegraf/types";
import { Room } from "../entity/room.entity";
import assert from "node:assert";
import { interestsService } from "../service/interests.sevice";
import { matchmakerWrapper } from "../matchmaker-wrapper/matchmaker-wrapper";

async function findInterlocutor(ctx: Context<Update>) {
   assert(ctx.from, "ctx.from is undefined");
   const userInterests = interestsService.getInterestsForUserId(ctx.from.id);
   const tempUserCriteria = userInterests.map(i => ({ interest: i, interestMeta: { primary: true, weight: 1 }, offsets: new Map(), }));
   if (tempUserCriteria.length === 0) return void ctx.reply("Вы не выбрали интересы, напишите /interests для выбора");

   matchmakerWrapper
      .findMatch(ctx.from, tempUserCriteria)
      .then(async (result) => { // then потому что если сделать await то мы не дойдем до следующего апдейта
         if (result === null) return; // это возникает когда мы отменили поиск из другого потока
         if (result === 'Already in queue') return void ctx.reply("Вы уже ищете собеседника");

         const match = result;
         try {
            roomService.setRoom(new Room({ participants: [ctx.from!, match] }));
         } catch (_) {
            // там два потока и создается две комнаты
            // у нас будет существовать комната если создались две, поэтому тут пустой catch
         }

         const thisChatterInterestsSet = new Set(interestsService.getInterestsForUserId(ctx.from!.id));
         const anotherChatterInterestsSet = new Set(interestsService.getInterestsForUserId(match.id));

         const commonInterests = thisChatterInterestsSet.intersection(anotherChatterInterestsSet);

         ctx.reply(`Собеседник найден с интересами: \n\n${commonInterests.values().toArray().join(", ")}`);
      });
   ctx.reply("Поиск собеседника...");
}

/**
 * @returns true if room was deleted, false if there is no room
 */
function deleteRoomIfExistent(ctx: Context<Update>) {
   assert(ctx.from, "ctx.from is undefined");

   const existingRoom = roomService.findOneByUser(ctx.from); // здесь нужно чекнуть на наличие комнаты в репозитории

   if (existingRoom) { //при присутствии комнаты закрыть ее и очистить историю для этой комнаты
      existingRoom.close(ctx.from);
      roomService.deleteRoomByUser(ctx.from);
      messageCoupler.clearForRoom(existingRoom.id);

      const anotherChatter = existingRoom.getAnotherChatter(ctx.from);

      ctx.reply("Вы закрыли комнату");
      ctx.telegram.sendMessage(anotherChatter.id, "Собеседник отключился");
      return true
   } else return false;
}
export const chatControlsComposer = new Composer()
   .command(["start", "search"], async (ctx) => {
      if (roomService.findOneByUser(ctx.from)) {
         ctx.reply("У вас уже есть собеседник");
         return;
      }
      await findInterlocutor(ctx);
   })
   .command("next", async (ctx) => {
      deleteRoomIfExistent(ctx);
      await findInterlocutor(ctx);
   })
   .command("stop", async (ctx) => {
      if (!deleteRoomIfExistent(ctx)) {
         const result = await matchmakerWrapper.cancel(ctx.from);

         if (result === 'Not in queue')
            ctx.reply("Вы не в комнате и не ищете собеседника");
         else
            ctx.reply("Вы остановили поиск");

      } else ctx.reply("Вы не в комнате и не ищете собеседника");
   })