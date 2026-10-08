import { run } from "@openai/agents";
import opsAgent from "@/lib/agent.js";
import { saveInvestigation } from "@/lib/db";

export async function POST(req) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      const toolsResults = [];
      let currentTool = "";

      try {
        const result = await run(opsAgent, "investigate order-api.", {
          stream: true,
          maxTurns: 6,
          signal: AbortSignal.any([
            req.signal,
            AbortSignal.timeout(60000),
          ]),
        });

        for await (const event of result) {
          if (event.name === "tool_called") {
            currentTool = event.item?.rawItem?.name || "unknown_tool";
            send({ type: "tool_called", tool: currentTool });
          }

          if (event.name === "tool_output") {
            const output = event.item?.output;
            send({ type: "tool_output", tool: event.item?.rawItem?.name || currentTool, output });
            toolsResults.push({ tool: currentTool, output });
          }
        }

        await result.completed;

        if (result.cancelled) {
          throw new Error("Investigation cancelled or client closed connection");
        }

        const report = result.finalOutput || "No final report produced.";
        send({ type: "report", report });

        if (typeof saveInvestigation === "function") {
          await saveInvestigation({
            createdAt: new Date(),
            toolsResults,
            report,
          });
        }
      } catch (error) {
        send({ type: "error", message: error.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
