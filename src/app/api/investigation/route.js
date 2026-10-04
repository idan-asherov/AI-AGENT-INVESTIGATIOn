import { run } from "@openai/agents";
import opsAgent from "../../../lib/agent.js";
import { saveInvestigation } from "@/lib/db";
import { ZodGUID } from "zod";

export async function POST(req) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event) {
        controller.enqueue(encoder.encode(JSON.stringify(event)+"\n"));
      }

 const toolsResults = [];

 try {
 const result = await run(opsAgent, "investigate order-api.", {
    stream: true,
    maxTurns:6,
    signal: AbortSignal.any([req.signal,
      AbortSignal.timeout(60000), 
    ]),
    
    
  });
  
  
  for await (const event of result) {

    if (event.name==="tool_called"){

    send({type:"tool_called", tool: event.item.rawItem.name}); 
  
const tool = event.item.rawItem.name;

}
    if (event.name==="tool_output"){
    send({type:"tool_output", output: event.item.output}) 
  
toolsResults.push({tool,output:event.item.output});
}
  
}

  }

  await result.completed;
  if (result.cancelled){
   throw new Error ("investigation stopped or the browses closed") 
  }

const report = result.finalOutput
send({type: "report", report});

await saveInvestigation({createdAt: new Date(), toolsResults, report });


 }catch (error){
send({type: "error", error: error.message });
}
finally {
  controller.close();
} 

return new Response(stream,{
  headers:{
    "content-type": "application/x-ndjson"
  }
})import { run } from "@openai/agents";
import opsAgent from "../../../lib/agent.js";
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
            currentTool = event.item.rawItem.name;
            send({ type: "tool_called", tool: currentTool });
          }

          if (event.name === "tool_output") {
            send({ type: "tool_output", output: event.item.output });
            toolsResults.push({ tool: currentTool, output: event.item.output });
          }
        }

        await result.completed;

        if (result.cancelled) {
          throw new Error("investigation stopped or the browser closed");
        }

        const report = result.finalOutput;
        send({ type: "report", report });

        await saveInvestigation({ createdAt: new Date(), toolsResults, report });

      } catch (error) {
        send({ type: "error", error: error.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson",
    },
  });
}