import { useAgent, useRenderToolCall } from "@copilotkit/react-native/headless";
import { View } from "react-native";

export function ToolCallStage({ agentId = "default" }: { agentId?: string }) {
  const { agent } = useAgent({ agentId });
  const renderToolCall = useRenderToolCall();

  const messages = agent.messages ?? [];

  // Pair each call with its result message — the same correlation the prebuilt
  // chat does. `toolMessage` is what selects the complete arm: pass it and the
  // call resolves to `"complete"` with `result`. Without one, `result` is
  // `undefined` and the status comes from the provider instead — `"executing"`
  // while this call id is one the provider is tracking as executing, and
  // `"inProgress"` otherwise.
  const toolMessages = new Map(
    messages.flatMap((message) =>
      message.role === "tool" ? [[message.toolCallId, message] as const] : [],
    ),
  );

  const toolCalls = messages.flatMap((message) =>
    message.role === "assistant" ? (message.toolCalls ?? []) : [],
  );

  // Each returned element is already keyed by tool-call id.
  return (
    <View>
      {toolCalls.map((toolCall) =>
        renderToolCall({
          toolCall,
          toolMessage: toolMessages.get(toolCall.id),
        }),
      )}
    </View>
  );
}
