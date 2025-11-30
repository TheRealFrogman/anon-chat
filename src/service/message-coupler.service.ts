import { Message } from "telegraf/types";
import { Room } from "../entity/room.entity";

export const messageCoupler = new class MessageCoupler {

   static store = new Map<Room['id'], Map<Message['message_id'], Message['message_id']>>();

   add(chat_id: Room['id'], message_ids: [Message['message_id'], Message['message_id']]) {
      if (!MessageCoupler.store.has(chat_id))
         MessageCoupler.store.set(chat_id, new Map());

      const store = MessageCoupler.store.get(chat_id)!;

      store.set(message_ids[0], message_ids[1]);
      store.set(message_ids[1], message_ids[0]);
   }

   clearForRoom(chat_id: Room['id']) {
      MessageCoupler.store.delete(chat_id);
   }

   getAnotherMessageId(chat_id: Room['id'], message_id: Message['message_id']) {
      return MessageCoupler.store
         .get(chat_id)
         ?.get(message_id)
         ?? null;
   }
}