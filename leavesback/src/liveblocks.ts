import { Liveblocks } from "@liveblocks/node";

const liveblocksSecret = process.env.LIVEBLOCKS_SECRET;
if (!liveblocksSecret) {
  throw new Error('LIVEBLOCKS_SECRET is not defined in the environment variables');
}
const liveblocks = new Liveblocks({
  secret: liveblocksSecret,
});

export default liveblocks;