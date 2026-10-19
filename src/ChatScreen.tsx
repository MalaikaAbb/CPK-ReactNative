import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAgent, useCopilotKit } from "@copilotkit/react-native/headless";
import { TodoManager } from "./tools/TodoManager";
import { ShowWeather } from "./tools/ShowWeather";
import { DeleteConfirmation } from "./tools/DeleteConfirmation";
import { WildcardRenderer } from "./tools/WildcardRenderer";
import { ToolCallStage } from "./ToolCallStage";

export function ChatScreen() {
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { copilotkit } = useCopilotKit(); 
  const { agent } = useAgent({ agentId: "default" });

  const messages = agent?.messages ?? [];
  const isLoading = agent?.isRunning ?? false;
  const chatMessages = messages.flatMap((message) => {
    if (
(message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.length > 0
    ) {
      return [
        {
          id: message.id,
          content: message.content,
        },
      ];
    }
    return [];
  });

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
if (!text || isLoading || !agent) return;

    setInputText("");
    agent.addMessage({ 
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    });
    await copilotkit.runAgent({ agent }); 
  }, [inputText, isLoading, agent, copilotkit]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={({ item }) => (
          <View style={{ padding: 12, maxWidth: "80%" }}>
            <Text>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item, i) => item.id ?? String(i)}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <ShowWeather />
      <DeleteConfirmation />
      <WildcardRenderer />
      <TodoManager />
      <ToolCallStage />
      <View style={{ flexDirection: "row", padding: 8 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderRadius: 8, padding: 8 }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={handleSend} style={{ padding: 8 }}>
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}