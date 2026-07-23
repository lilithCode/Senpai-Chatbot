import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const HACKCLUB_BASE = "https://ai.hackclub.com";

// replies when requests fail
const OFFLINE_REPLIES = [
  "[Can't reach Senpai right now, Try again in a sec]",
  "[Your messsage didn't reach Senpai]",
  "[Internet is down for Senpai, Try again later]",
  "[Maybe Senpai is sleeping, Try again in a sec]",
];

function pickOfflineReply(): string {
  return OFFLINE_REPLIES[Math.floor(Math.random() * OFFLINE_REPLIES.length)];
}

// Fetch with retry and timeout when calling APIs (Hack Club AI, Senpai Space)
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  timeoutMs = 15000,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      console.warn(
        `Fetch attempt ${attempt}/${retries} failed for ${url}:`,
        err,
      );
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }

  throw lastError;
}

// Rewrites user query, decides if it needs web search, and collects user facts using LLM
async function routeQuery(
  message: string,
  history: { role: string; content: string }[],
  hackclubKey: string,
): Promise<{
  needsSearch: boolean;
  searchQuery: string;
  cleanQuestion: string;
  userFacts: string;
}> {
  // Use recent msgs for history references
  const recentHistory = history
    .slice(-6)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  // Use full history to extract user facts
  const fullHistory = history.map((m) => `${m.role}: ${m.content}`).join("\n");

  const routerPrompt = `You are a preprocessor for a chatbot named Senpai. Given the conversation and the user's latest message, do three things:

1. Rewrite the user's latest message as a single, clear, self-contained question or statement — resolve any pronouns or references using the conversation history (e.g. "who won it" becomes "who won the [specific event]"). Keep it short and natural, as if the user said it clearly the first time.

2. Decide if answering this requires current/real-world information that a language model trained in the past would not know (news, sports results, prices, recent events, anything time-sensitive). General knowledge, philosophy, personal chat, and opinions do NOT need search.

3. Scan the FULL conversation (including the latest message) for durable facts about the user worth remembering across the whole chat — their name, stated preferences, ongoing projects, or anything they've explicitly told the bot about themselves. Output this as a short plain-English list (one line per fact, no more than 5 facts, most important first). If nothing notable has been shared, output an empty string.

Full conversation:
${fullHistory}

Recent turns (for reference resolution):
${recentHistory}

Latest user message: "${message}"

Respond ONLY with JSON, no other text:
{"needs_search": true/false, "clean_question": "...", "search_query": "...", "user_facts": "..."}

("search_query" only needs to be meaningful if needs_search is true. "user_facts" should be empty string "" if nothing durable was shared.)`;

  // using Hackclub for llm api calling
  try {
    const res = await fetchWithRetry(
      `${HACKCLUB_BASE}/proxy/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hackclubKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: routerPrompt }],
          temperature: 0,
        }),
      },
      2,
      8000,
    );

    if (!res.ok) {
      console.error("Router call failed:", res.status, await res.text());
      return {
        needsSearch: false,
        searchQuery: "",
        cleanQuestion: message,
        userFacts: "",
      };
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      needsSearch: !!parsed.needs_search,
      searchQuery: parsed.search_query || parsed.clean_question || message,
      cleanQuestion: parsed.clean_question || message,
      userFacts: parsed.user_facts || "",
    };
  } catch (e) {
    console.error("Router error:", e);
    return {
      needsSearch: false,
      searchQuery: "",
      cleanQuestion: message,
      userFacts: "",
    };
  }
}

// Runs web search and returns clean facts text
async function runWebSearch(
  query: string,
  hackclubKey: string,
): Promise<string> {
  try {
    const res = await fetchWithRetry(
      `${HACKCLUB_BASE}/proxy/v1/exa/answer`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hackclubKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
      2,
      10000,
    );

    if (!res.ok) {
      console.error("Exa search failed:", res.status, await res.text());
      return "";
    }

    const data = await res.json();
    // As Hackclub returns citations too so remove citation markers like [1]
    const rawAnswer: string = data.answer || "";
    const cleanAnswer = rawAnswer.replace(/\[\d+\]/g, "").trim();
    return cleanAnswer;
  } catch (e) {
    console.error("Web search error:", e);
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: { role: string; content: string }[] = body.messages || [];

    const spaceUrl = process.env.Senpai_SPACE_URL;
    const hfToken = process.env.HF_TOKEN;
    const hackclubKey = process.env.HACKCLUB_AI_KEY;

    if (!spaceUrl || !hfToken) {
      console.error(
        "Server misconfigured: missing Senpai_SPACE_URL or HF_TOKEN",
      );
      return NextResponse.json({ reply: pickOfflineReply() });
    }

    const lastMessage = messages[messages.length - 1]?.content || "";
    const history = messages.slice(0, -1);

    // Prepare clean message, user facts, and verified facts
    let finalMessage = lastMessage;
    let verifiedFacts = "";
    let userFacts = "";

    if (hackclubKey) {
      try {
        const {
          needsSearch,
          searchQuery,
          cleanQuestion,
          userFacts: facts,
        } = await routeQuery(lastMessage, history, hackclubKey);

        console.log("ROUTER DECISION:", {
          needsSearch,
          searchQuery,
          cleanQuestion,
          userFacts: facts,
        });

        finalMessage = cleanQuestion;
        userFacts = facts;

        if (needsSearch && searchQuery) {
          const searchResult = await runWebSearch(searchQuery, hackclubKey);
          console.log("FACTS:", searchResult);
          verifiedFacts = searchResult;
        }
      } catch (e) {
        console.error("RAG pipeline error (continuing without search):", e);
      }
    } else {
      console.warn("HACKCLUB_AI_KEY not set — skipping RAG, using plain chat.");
    }

    console.log("FINAL MESSAGE TO Senpai:", finalMessage);
    console.log("USER FACTS TO Senpai:", userFacts);
    console.log("VERIFIED FACTS TO Senpai:", verifiedFacts);

    // Call Senpai with 3 retry attempts
    // data order: message, history, user_memory, verified_facts
    let startRes: Response;
    try {
      startRes = await fetchWithRetry(
        `${spaceUrl}/gradio_api/call/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hfToken}`,
          },
          body: JSON.stringify({
            data: [finalMessage, history, userFacts, verifiedFacts],
          }),
        },
        2,
        45000,
      );
    } catch (e) {
      console.error("All retry attempts failed reaching Senpai Space:", e);
      return NextResponse.json({ reply: pickOfflineReply() });
    }

    if (!startRes.ok) {
      const text = await startRes.text();
      console.error("Gradio call start failed:", startRes.status, text);
      return NextResponse.json({ reply: pickOfflineReply() });
    }

    const { event_id } = await startRes.json();

    let streamRes: Response;
    try {
      streamRes = await fetchWithRetry(
        `${spaceUrl}/gradio_api/call/chat/${event_id}`,
        { headers: { Authorization: `Bearer ${hfToken}` } },
        2,
        30000,
      );
    } catch (e) {
      console.error("All retry attempts failed on stream fetch:", e);
      return NextResponse.json({ reply: pickOfflineReply() });
    }

    if (!streamRes.ok || !streamRes.body) {
      return NextResponse.json({ reply: pickOfflineReply() });
    }

    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let reply = pickOfflineReply();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() || "";

      for (const chunk of chunks) {
        const eventLine = chunk.split("\n").find((l) => l.startsWith("event:"));
        const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;

        const eventType = eventLine?.replace("event:", "").trim();
        const dataStr = dataLine.replace("data:", "").trim();

        if (eventType === "complete") {
          try {
            const parsed = JSON.parse(dataStr);
            reply = Array.isArray(parsed) ? parsed[0] : String(parsed);
          } catch {
            console.error("Failed to parse SSE complete data:", dataStr);
          }
        }

        // if get any error with HF then pick a random reply excuse
        if (eventType === "error") {
          console.error("GRADIO ERROR EVENT DATA:", dataStr);
          reply = pickOfflineReply();
        }
      }
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: pickOfflineReply() });
  }
}
