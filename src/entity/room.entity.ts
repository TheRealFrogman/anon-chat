import { Message, User } from "telegraf/types";
import { RoomId } from "./room-id.value";

export type RoomProps = {
   id: RoomId;
   messages: [Message, Message][];
   createdAt: Date;
   active: boolean;
   participants: [User, User];
   closer?: User;
   closedAt?: Date;
};
export type RoomInitializer = {
   id?: RoomId;
   messages?: [Message, Message][];
   createdAt?: Date;
   active?: boolean;
   participants: [User, User];
   closer?: User;
   closedAt?: Date;
};


export class Room implements RoomProps {
   public id: RoomId;
   public messages: [Message, Message][] = [];
   public createdAt: Date = new Date();
   public active: boolean = false;
   public participants: [User, User];
   public closer?: User;
   public closedAt?: Date;
   // version: number;

   constructor(props: RoomInitializer) {
      Object.assign(this, props)

      this.participants = props.participants;

      if (this.participants.length > new Set(this.participants).size)
         throw new Error("Participants in RandomDialog are not unique");
      if (!this.participants || !this.participants.length)
         throw new Error("Provided no participants in RandomDialog");
      if (this.participants.length > 2)
         throw new Error("Participants in RandomDialog should be exactly 2");

      this.id = RoomId.create(...this.participants.map(u=> u.id) as [User['id'], User['id']]);
      this.active = true;
   }

   get isClosed() {
      return !!this.closedAt
   }
   isUserInMe(chatter: User): boolean {
      return this.participants.includes(chatter)
   }
   close(user: User) {
      this.closedAt = new Date();
      this.closer = user;
      this.active = false;
      Object.seal(this);
   }


   getAnotherChatter(user: User) {
      return this.participants.find(participant => participant.id !== user.id)!;
   }
}
