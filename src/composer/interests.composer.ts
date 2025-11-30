import { Composer } from "telegraf";
import { makeKeyboard } from "../keyboards/makeKeyboard";

import { interestsService } from "../service/interests.sevice";
import { Interest } from "../../matcher/src/util/Criteria";
import { allowedInterests } from "../matchmaker-wrapper/matchmaker-wrapper";

import { ApiError } from "telegraf/types";
export const interestComposer = new Composer()
   .command('interests', async (ctx) => {
      const rows = [];
      const userInterests = interestsService.getInterestsForUserId(ctx.from.id);

      for (let i = 0; i < allowedInterests.length; i += 2) {
         let interest1FinalText = allowedInterests[i];
         let interest2FinalText = allowedInterests[i + 1] // may be undefined;

         if (userInterests.includes(interest1FinalText as Interest)) {
            interest1FinalText = "✅ " + interest1FinalText;
         }
         if (userInterests.includes(interest2FinalText as Interest)) {
            interest2FinalText = "✅ " + interest2FinalText;
         }

         const row = [interest1FinalText, interest2FinalText].filter(Boolean) as string[] // that's why we filter
         rows.push(row);
      }

      ctx.reply("Выберите интересы", makeKeyboard(rows))
   })
   .action(/^btn_.*$/, async (ctx) => {
      //@ts-expect-error
      const clickedAction = ctx.callbackQuery.data
      //@ts-expect-error
      const markup = ctx.callbackQuery.message!.reply_markup as { inline_keyboard: any[][] }

      const clickedButton = markup.inline_keyboard.flat().find(item => item.callback_data === clickedAction) as { text: string, callback_data: string };
      const interestText = clickedButton.text.replace("✅ ", "");

      interestsService.switchInterest(ctx.from.id, interestText as Interest);
      const userInterests = interestsService.getInterestsForUserId(ctx.from.id);

      if (userInterests.includes(interestText as Interest)) {
         clickedButton.text = "✅ " + interestText;
      } else {
         clickedButton.text = interestText;
      }

      try {
         // я поменял маркап, теперь вставляю его вместо старого
         await ctx.editMessageReplyMarkup(markup);
      } catch (error) {
         if (((error as any).response as ApiError).error_code === 400) return; // рабочий код, не взирая на expect error
         else throw error
      }
   })