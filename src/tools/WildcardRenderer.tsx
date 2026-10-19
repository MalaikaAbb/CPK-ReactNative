import { useRenderTool } from "@copilotkit/react-native/headless";
import { Text } from "react-native";

export function WildcardRenderer() {
  useRenderTool(
    {
      name: "*",
      render: ({ name, status }) => (
        <Text>
          {status === "complete" ? "✓" : "⏳"} {name}
        </Text>
      ),
    },
    [],
  );

  return null;
}
