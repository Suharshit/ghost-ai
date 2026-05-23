import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";

import { prisma } from "@/lib/prisma";

interface TokenRequestBody {
  runId: string;
}

function parseRequestBody(value: unknown): TokenRequestBody | null {
  if (value === null || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.runId !== "string") {
    return null;
  }

  const runId = candidate.runId.trim();
  if (!runId) {
    return null;
  }

  return { runId };
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsedBody = parseRequestBody(body);
  if (!parsedBody) {
    return Response.json({ error: "runId is required" }, { status: 400 });
  }

  const taskRun = await prisma.taskRun.findFirst({
    where: {
      runId: parsedBody.runId,
      userId,
    },
    select: { runId: true },
  });

  if (!taskRun) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: taskRun.runId,
      },
    },
  });

  return Response.json({ token });
}
