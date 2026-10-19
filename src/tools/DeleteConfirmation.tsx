import { Text, TouchableOpacity, View } from "react-native";
import { useHumanInTheLoop, ToolCallStatus } from "@copilotkit/react-native/headless";
import { z } from "zod";

export function DeleteConfirmation() {
  useHumanInTheLoop(
    {
      name: "confirmDeletion",
      description: "Ask the user to confirm before deleting items",
      parameters: z.object({
        itemName: z.string().describe("Name of the item to delete"),
        itemCount: z.number().describe("Number of items to delete"),
      }),
      render: ({ args, status, respond, result }) => {
        if (status === ToolCallStatus.InProgress) {
          return (
            <View style={{ padding: 16 }}>
              <Text style={{ color: "#6b7280" }}>Preparing confirmation...</Text>
            </View>
          );
        }

        if (status === ToolCallStatus.Executing && respond) {
          return (
            <View style={{ padding: 16, borderWidth: 1, borderRadius: 8 }}>
              <Text>
                Are you sure you want to delete {args.itemCount} {args.itemName}
                (s)?
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => respond({ confirmed: true })}
                  style={{ backgroundColor: "#ef4444", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}
                >
                  <Text style={{ color: "#fff" }}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => respond({ confirmed: false })}
                  style={{ backgroundColor: "#d1d5db", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

        if (status === ToolCallStatus.Complete && result) {
          const parsed = JSON.parse(result);
          return (
            <View style={{ padding: 8 }}>
              <Text style={{ fontSize: 12, color: "#4b5563" }}>
                {parsed.confirmed ? "Items deleted." : "Deletion cancelled."}
              </Text>
            </View>
          );
        }

        return null;
      },
    },
    [],
  );

  return null;
}
