import { Markup } from "telegraf";

import { KEYBOARD_ACTIONS, composeCallbackData } from "../actions/actions";

export const KbConversationEndExtra = ({ roomId }: { roomId: string }) => {
   return Markup.inlineKeyboard([
      [
         Markup.button.callback(
            "Report",
            composeCallbackData(KEYBOARD_ACTIONS.report, roomId)
         ),
      ],
      [
         Markup.button.callback("👍", composeCallbackData(KEYBOARD_ACTIONS.like, roomId)),
         Markup.button.callback("👎", composeCallbackData(KEYBOARD_ACTIONS.dislike, roomId)),
      ],
   ]);
};
