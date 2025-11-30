import { User } from "telegraf/types";
import { Brand } from "../../matcher/src/util/Brand";
import assert from "assert";

export type RoomId = Brand<string, "RoomId">;

export namespace RoomId {
   export function create(userId1: User['id'] | unknown, userId2: User['id'] | unknown): RoomId {
      assert(typeof userId1 === "number", "userId1 is not a number");
      assert(typeof userId2 === "number", "userId2 is not a number");
      
      const first = Math.min(userId1, userId2);
      const second = Math.max(userId1, userId2);
      
      return `${first}-${second}` as RoomId
   }
}