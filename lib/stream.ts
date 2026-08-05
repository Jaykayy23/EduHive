import { StreamChat } from "stream-chat";

const streamServerClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!,
  process.env.STREAM_SECRET,
);

export async function provisionStreamUser(user: {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}) {
  return streamServerClient.upsertUser({
    id: user.id,
    username: user.username,
    name: user.displayName,
    image: user.avatarUrl ?? undefined,
  });
}

export default streamServerClient;
