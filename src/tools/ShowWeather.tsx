import { useFrontendTool } from "@copilotkit/react-native/headless";
import type { FrontendToolRenderFunction } from "@copilotkit/react-native/headless";
import { Text } from "react-native";
import { z } from "zod";

const renderWeather: FrontendToolRenderFunction<{ city: string }> = ({
  args,
}) => <Text>The weather in {args.city} is sunny</Text>;

export function ShowWeather() {
  useFrontendTool({
    name: "showWeather",
    description: "Show the weather",
    parameters: z.object({ city: z.string() }),
    handler: async ({ city }) => city,
    render: renderWeather,
  });

  return null;
}
