import { User } from "telegraf/types";
import { Room } from "../entity/room.entity";
import { Persistable } from "./persistable.base";

import JSONdb from "simple-json-db";
const roomsDb = new JSONdb("./db/rooms.json");
const roomsByUserIdDb = new JSONdb("./db/roomsByUserId.json");

export const roomService = new class RoomService extends Persistable {
   private static rooms: Room[] = []
   private static roomsByUserId = new Map<number, Room>;
   constructor() {
      super();
      setInterval(this.filterRooms, 60 * 1000);
   }

   preload() {
      console.log('roomservice preload');

      const entries = roomsDb.get("rooms") || [];
      RoomService.rooms = entries.map((entry: any) => new Room(entry));

      const entriesByUserId = (roomsByUserIdDb.get("roomsByUserId") || []) as [number, Room['id']][];
      const roomsByUserIdData = entriesByUserId.map(([userId, roomId]) => [userId, RoomService.rooms.find(room => room.id === roomId)!]) as [number, Room][];
      RoomService.roomsByUserId = new Map<number, Room>(roomsByUserIdData);
   }

   persist() {
      this.filterRooms();
      console.log('roomservice persist');

      // const roomsData = RoomService.rooms.map(room => room.serialize());
      const roomsData = RoomService.rooms;
      roomsDb.set("rooms", roomsData);

      const roomsByUserIdData = Array.from(RoomService.roomsByUserId.entries().map(([userId, room]) => [userId, room.id]));
      roomsByUserIdDb.set("roomsByUserId", roomsByUserIdData);
   }

   filterRooms() {
      RoomService.rooms = RoomService.rooms.filter(room => room.active);
   }
   findOne(id: Room['id']) {
      return RoomService.rooms.find(room => room.id === id) ?? null;
   }
   findOneByUser(user: User): Room | null {
      return RoomService.roomsByUserId.get(user.id) ?? null;
   }

   deleteRoomByUser(user: User) {
      const room = this.findOneByUser(user);
      if (!room) return false;

      const bothHaveRoom = room.participants.every(user => RoomService.roomsByUserId.has(user.id))

      if (bothHaveRoom) {
         RoomService.rooms = RoomService.rooms.filter(r => r.id !== room.id);
         room.participants.forEach(user => RoomService.roomsByUserId.delete(user.id))
         return true;
      } else {
         throw new Error("Programmatical error");
      }
   }

   setRoom(room: Room) {
      if (RoomService.rooms.find(r => r.id === room.id)) throw new Error("Room already exists");
      RoomService.rooms.push(room); // добавить в общий список комнат

      room.participants.forEach(user => { // добавить список по пользователю
         const existingRoom = RoomService.roomsByUserId.get(user.id);
         if (existingRoom) throw new Error("Programmatical error");
         RoomService.roomsByUserId.set(user.id, room)
      })
   }
}
