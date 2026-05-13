import { NextResponse } from "next/server";
import { getRegion } from "@/lib/regions";
import { findCoachHint, formatBoard, isValidCoachBoard } from "@/lib/sudoku/coach";

type CoachChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type CoachRequest = {
  regionId?: string;
  board?: unknown;
  givens?: unknown;
  notes?: string[][][];
  selected?: { row: number; col: number } | null;
  mistakes?: number;
  timerSeconds?: number;
  notesMode?: boolean;
  modifierState?: Record<string, unknown>;
  question?: string;
  chatHistory?: CoachChatMessage[];
};

type CoachResponse = {
  advice: string;
  source: "kimi" | "local";
  model?: string;
  providerMessage?: string;
  target?: { row: number; col: number };
};

function cleanMessages(messages: unknown): CoachChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message): message is CoachChatMessage => {
      if (!message || typeof message !== "object") return false;
      const candidate = message as Partial<CoachChatMessage>;
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.content === "string" &&
        candidate.content.trim().length > 0
      );
    })
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 900)
    }));
}

function fallbackResponse(board: number[][], question: string) {
  const hint = findCoachHint(board);
  const questionPrefix = question.trim() ? "Based on your question, " : "";
  return `${questionPrefix}${hint.detail}`;
}

function uniqueModels(primaryModel: string) {
  return [...new Set([primaryModel, "moonshotai/kimi-k2.6", "moonshotai/kimi-k2.5"])];
}

async function readStreamedAdvice(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let buffer = "";
  let advice = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{
            delta?: { content?: unknown };
            message?: { content?: unknown };
          }>;
        };
        const content =
          parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content;
        if (typeof content === "string") advice += content;
      } catch {
        continue;
      }
    }
  }

  return advice.trim();
}

export async function POST(request: Request) {
  let body: CoachRequest;
  try {
    body = (await request.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid coach request." }, { status: 400 });
  }

  if (!isValidCoachBoard(body.board)) {
    return NextResponse.json({ error: "Invalid Sudoku board." }, { status: 400 });
  }

  const board = body.board;
  const region = body.regionId ? getRegion(body.regionId) : undefined;
  const localHint = findCoachHint(board);
  const question = body.question?.trim() || "Give me the best next logical hint.";
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      advice: fallbackResponse(board, question),
      source: "local",
      providerMessage: "NVIDIA_API_KEY is missing, so the local Sudoku coach answered.",
      target: localHint.target
    } satisfies CoachResponse);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const shortFact = `${localHint.detail.split(".")[0]}.`;
    const prompt = [
      "Reply in one natural sentence as a calm Sudoku coach.",
      "Use this exact current-board fact.",
      `Fact: ${shortFact.slice(0, 160)}`
    ].join("\n");

    const basePayload = {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 48,
      temperature: 0.2,
      top_p: 0.95,
      stream: false,
      include_reasoning: false,
      chat_template_kwargs: { thinking: false }
    };

    let lastError = "";
    for (const model of uniqueModels(process.env.NVIDIA_KIMI_MODEL ?? "moonshotai/kimi-k2.5")) {
      const response = await fetch(
        process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            ...basePayload
          })
        }
      );

      if (!response.ok) {
        lastError = `Coach request failed with ${response.status}`;
        continue;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      const advice = typeof content === "string" ? content.trim() : "";

      if (advice) {
        return NextResponse.json({
          advice,
          source: "kimi",
          model,
          target: localHint.target
        } satisfies CoachResponse);
      }

      lastError = "Coach returned an empty response.";
    }

    throw new Error(lastError || "Coach request failed.");
  } catch (error) {
    const providerMessage =
      error instanceof Error ? error.message : "unknown provider error";
    console.warn("AI coach provider failed:", providerMessage);
    return NextResponse.json(
      {
        error: `Kimi provider unavailable: ${providerMessage}`
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
