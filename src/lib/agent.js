import { Agent } from "@openai/agents";
import {
  checkServiceHealth,
  getRecentLogs,
  getProductionInfo,
} from "./tools.js";

const agent = new Agent({
  name: "DevOps On-Call Investigator",
  model: "gpt-4o", // או הדגם שהוא מגדיר בכיתה
  tools: [checkServiceHealth, getRecentLogs, getProductionInfo],
  instructions: `...`,
});

export default agent;
