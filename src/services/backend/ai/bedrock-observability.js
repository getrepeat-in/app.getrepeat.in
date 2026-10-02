import { AsyncLocalStorage } from "node:async_hooks";
import { trace, SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PostHogSpanProcessor } from "@posthog/ai/otel";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const aiContext = new AsyncLocalStorage();

class AIContextSpanProcessor {
  onStart(span) {
    const context = aiContext.getStore();
    if (!context) return;

    span.setAttribute("$ai_session_id", context.sessionId);
    span.setAttribute("posthog.distinct_id", context.distinctId);
  }

  onEnd() {}
  shutdown() {
    return Promise.resolve();
  }
  forceFlush() {
    return Promise.resolve();
  }
}

let sdk = null;
let posthogSpanProcessor = null;
if (projectToken && host) {
  posthogSpanProcessor = new PostHogSpanProcessor({ projectToken, host });
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": "nearby24-menu-ai",
    }),
    spanProcessors: [
      posthogSpanProcessor,
      new AIContextSpanProcessor(),
    ],
    instrumentations: [new AwsInstrumentation()],
  });
  sdk.start();
} else if (process.env.NODE_ENV === "development") {
  const missingVariable = projectToken
    ? "NEXT_PUBLIC_POSTHOG_HOST"
    : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

export function withMenuDescriptionGeneration({ distinctId }, callback) {
  if (!sdk) return callback();

  return aiContext.run(
    {
      distinctId,
      // This product has no persisted AI conversation; the server process is the session.
      sessionId: "menu-description-generation",
    },
    () =>
      trace.getTracer("nearby24.bedrock").startActiveSpan(
        "gen_ai.menu_description_generation",
        {
          kind: SpanKind.INTERNAL,
          attributes: {
            "gen_ai.operation.name": "generate_content",
          },
        },
        async (span) => {
          try {
            return await callback();
          } catch (error) {
            span.recordException(error);
            span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
            throw error;
          } finally {
            span.end();
            await posthogSpanProcessor?.forceFlush();
          }
        },
      ),
  );
}

export function getBedrockRuntime() {
  // The AWS SDK must load after sdk.start() so AwsInstrumentation can patch it.
  return import("@aws-sdk/client-bedrock-runtime");
}
