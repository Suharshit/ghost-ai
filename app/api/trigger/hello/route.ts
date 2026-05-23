import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk/v3";

import type { helloWorldTask } from "@/src/trigger/example";

function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const message =
    payload !== null &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message.trim().length > 0
      ? payload.message.trim()
      : "Triggered from Ghost AI API route";

  const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
    source: "api",
    message,
  });

  return Response.json({ taskId: handle.id }, { status: 202 });
}
