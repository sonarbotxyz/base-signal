import { NextRequest } from "next/server";
import { getAgentByApiKey, Agent } from "./db";

export interface AgentAuth {
  agentId: number;
  agentName: string;
  agent: Agent;
}

export function authenticateAgent(req: NextRequest): AgentAuth | null {
  const authHeader = req.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.headers.get("x-api-key");

  if (!apiKey) return null;

  const agent = getAgentByApiKey(apiKey);
  if (!agent) return null;

  return {
    agentId: agent.id,
    agentName: agent.name,
    agent,
  };
}
