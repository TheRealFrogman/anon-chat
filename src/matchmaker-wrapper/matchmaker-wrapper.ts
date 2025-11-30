import { User } from "telegraf/types";
import { Orchestration } from "../../matcher/src/Orchestration";
import { Criterions, Interest } from "../../matcher/src/util/Criteria";
import { AlreadyInQueue, NotInQueue } from "../../matcher/src/errors";

export const allowedInterests = ['Программирование', 'Английский язык', 'Игры', 'Музыка', 'Спорт', 'Мемы', 'Одиночество', 'Фильмы'];
export const matcher = new Orchestration(new Set(allowedInterests) as Set<Interest>);

class Users {
   static users: User[] = []
   upsertUser(user: User) {
      const index = Users.users.findIndex(u => u.id === user.id);
      if (index === -1) {
         return Users.users.push(user);
      } else {
         Users.users[index] = user;
         return index;
      }
   }
   getUser(id: User['id']) {
      const user = Users.users.find(user => user.id === id);
      if (!user) throw new Error("Programmatical error");
      return user
   }

   deleteUser(id: User['id']) {
      Users.users = Users.users.filter(u => u.id !== id);
   }
}

export const matchmakerWrapper = new class MatchmakerWrapper {
   private users = new Users;

   async findMatch(user: User, criterions: Criterions): Promise<User | null | 'Already in queue'> {
      this.users.upsertUser(user);
      try {
         const { matchId } = await matcher.findMatch(user.id.toString(), criterions);
         return (matchId ? this.users.getUser(+matchId) : null)
      } catch (error) {
         if (error instanceof AlreadyInQueue) {
            return 'Already in queue'
         } else throw error
      }
   }
   async cancel(user: User): Promise<true | "Not in queue"> {
      try {
         return await matcher.cancel(user.id.toString());
      } catch (error) {
         if (error instanceof NotInQueue) {
            return "Not in queue"
         } else throw error;
      } finally {
         this.users.deleteUser(user.id);
      }
   }
}