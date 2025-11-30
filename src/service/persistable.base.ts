

setImmediate(() => {
   process.addListener("SIGINT", () => {
      process.exit();
   })
   process.addListener("SIGTERM", () => {
      process.exit();
   })
})

export abstract class Persistable {

   constructor() {
      this.preload();
      process.addListener("SIGINT", () => {
         this.persist();
      });
      process.addListener("SIGTERM", () => {
         this.persist();
      });
   }

   // persist db into json
   protected abstract persist(): Promise<void> | void

   // load db into memory
   protected abstract preload(): Promise<void> | void
}