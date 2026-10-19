import { useState } from "react";
import { Text, View } from "react-native";
import { useFrontendTool } from "@copilotkit/react-native/headless";
import { z } from "zod";

export function TodoManager() {
  const [todos, setTodos] = useState<string[]>([]);

  useFrontendTool(
    {
      name: "addTodo",
      description: "Add a new item to the user's todo list",
      parameters: z.object({
        text: z.string().describe("The todo item text"),
        priority: z.enum(["low", "medium", "high"]).describe("Priority level"),
      }),
      handler: async ({ text, priority }) => {
        setTodos((prev) => [...prev, text]);
        return `Added "${text}" with ${priority} priority`;
      },
    },
    [],
  );

  return (
    <View>
      {todos.map((t, i) => (
        <Text key={i}>{t}</Text>
      ))}
    </View>
  );
}
