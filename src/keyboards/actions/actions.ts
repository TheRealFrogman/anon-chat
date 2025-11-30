import assert = require("assert");

export enum KEYBOARD_ACTIONS {
   report = "report",
   like = "like",
   dislike = "dislike",
}
const delimeter = "_";
const digitToken = "\\d";

const reportRegex = new RegExp(`^${KEYBOARD_ACTIONS.report}${delimeter}${digitToken}+$`);
const likeRegex = new RegExp(`^${KEYBOARD_ACTIONS.like}${delimeter}${digitToken}+$`);
const dislikeRegex = new RegExp(`^${KEYBOARD_ACTIONS.dislike}${delimeter}${digitToken}+$`);

/** This makes a trigger (filter) for hooking a controller to it. */
export function Trigger(action: KEYBOARD_ACTIONS) {
   switch (action) {
      case KEYBOARD_ACTIONS.dislike:
         return dislikeRegex;
      case KEYBOARD_ACTIONS.like:
         return likeRegex;
      case KEYBOARD_ACTIONS.report:
         return reportRegex;
   }
}

/** This makes callback data for a button */
export function composeCallbackData(type: KEYBOARD_ACTIONS.dislike, roomId: string): string;
export function composeCallbackData(type: KEYBOARD_ACTIONS.like, roomId: string): string;
export function composeCallbackData(type: KEYBOARD_ACTIONS.report, roomId: string): string;
export function composeCallbackData(type: KEYBOARD_ACTIONS, ...args: any[]): string {
   assert(args.length === 1, new Error("For now I can accept only one extra arg"));
   return `${type}_${args[0]}`;
}

function parseActionDiscriminator(input: string): string | null {
   const actions = Object.values(KEYBOARD_ACTIONS);
   for (const action of actions) if (input.startsWith(action)) return action;
   return null;
}
