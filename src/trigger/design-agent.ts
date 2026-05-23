import { logger, task } from "@trigger.dev/sdk/v3";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    logger.log("Design agent task triggered", { payload });

    return {
      received: payload,
    };
  },
});
