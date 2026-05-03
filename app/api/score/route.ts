import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a brutally honest, witty judge of LinkedIn posts. Your job is to score how cringy a LinkedIn post is and explain exactly why.

Score the post from 0 to 100:
- 0–20: Refreshingly normal. A rare human being.
- 21–40: Mild cringe. Some self-awareness missing but forgivable.
- 41–60: Classic LinkedIn energy. You've been on this app too long.
- 61–80: Deeply unwell. Please log off.
- 81–100: A LinkedIn influencer in the wild. Seek help immediately.

Detect flags from this list (only include ones that genuinely apply):
- humblebrag: disguising a flex as a lesson or struggle
- fake_vulnerability: performing emotion to seem relatable
- emoji_abuse: emojis used as a substitute for personality
- humble_flex: "I almost didn't post this but I just got promoted to VP"
- corporate_inspiration: vague motivational quote with no actual insight
- unnecessary_story: "I was at the airport. A janitor taught me about leadership."
- fake_modesty: "I'm no expert but..." followed by acting like an expert
- engagement_bait: "Comment YES if you agree!" / "What do you think?"
- buzzword_soup: synergy, disruption, leverage, ecosystem, etc.
- overuse_of_we: taking credit while sounding humble by saying "we"

Return ONLY a JSON object in this exact format, no markdown, no explanation outside the JSON:

{
  "score": <number 0-100>,
  "verdict": "<one punchy sentence summarizing the overall vibe>",
  "flags": [
    {
      "type": "<flag_name>",
      "quote": "<exact short quote from the post that triggered this flag>",
      "explanation": "<one witty sentence explaining why this is cringe>"
    }
  ],
  "rewrite": "<a rewritten version of the post that says the same thing but like a normal person>"
}`;

const SAMPLE_RESPONSE = JSON.stringify({
  score: 74,
  verdict:
    "A masterclass in performing humility while aggressively flexing. LinkedIn would be proud.",
  flags: [
    {
      type: "humblebrag",
      quote: "I almost didn't share this",
      explanation:
        "You definitely drafted this three times before posting it.",
    },
    {
      type: "unnecessary_story",
      quote: "A stranger in the elevator changed my life",
      explanation:
        "No one has ever learned anything meaningful in a 30-second elevator ride.",
    },
    {
      type: "engagement_bait",
      quote: "What's one lesson that changed your career?",
      explanation:
        "Fishing for comments with a question you don't actually care about.",
    },
    {
      type: "corporate_inspiration",
      quote: "Success is a mindset, not a destination",
      explanation: "Inspirational fridge magnet energy.",
    },
  ],
  rewrite:
    "Got promoted last month. Been thinking a lot about what actually helped — probably just showing up consistently and asking for feedback early. Anyway, congrats to the team.",
});

export async function POST(request: Request) {
  const { post } = await request.json();

  if (!post || typeof post !== "string" || post.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Post content is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const encoder = new TextEncoder();
    const sampleStream = new ReadableStream({
      async start(controller) {
        for (const char of SAMPLE_RESPONSE) {
          controller.enqueue(encoder.encode(char));
          await new Promise((r) => setTimeout(r, 8));
        }
        controller.close();
      },
    });
    return new Response(sampleStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Score this LinkedIn post:\n\n${post.trim()}`,
      },
    ],
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
