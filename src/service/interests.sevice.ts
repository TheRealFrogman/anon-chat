import { User } from "telegraf/types"
import { Interest } from "../../matcher/src/util/Criteria"
import { Persistable } from "./persistable.base";

import JSONdb from "simple-json-db";
const interestsDb = new JSONdb("./db/interests.json");

// тут ваще надо персистентно делать данные
export const interestsService = new class InterestsService extends Persistable {
   private static interestsForUserId: Map<User['id'], Interest[]> = new Map()

   constructor() {
      super();
   }

   preload() {
      const entries = interestsDb.get("interests");
      InterestsService.interestsForUserId = new Map(entries);
      console.log("INTERESTS", InterestsService.interestsForUserId)
   }
   persist() {
      console.log("INTERESTS", InterestsService.interestsForUserId)
      interestsDb.set('interests', Array.from(InterestsService.interestsForUserId.entries()));
   }

   switchInterest(userId: User['id'], interest: Interest) {
      let interests = InterestsService.interestsForUserId.get(userId);
      if (!interests) {
         interests = [];
         InterestsService.interestsForUserId.set(userId, interests);
      }

      const index = interests.indexOf(interest);
      if (index === -1) {
         interests.push(interest);
      } else {
         interests.splice(index, 1);
      }
   }

   getInterestsForUserId(userId: User['id']) {
      return InterestsService.interestsForUserId.get(userId) || [];
   }
}