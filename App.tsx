/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { CopilotKitProvider } from "@copilotkit/react-native/headless"; 
import { Platform } from "react-native";
import { ChatScreen } from "./src/ChatScreen";

const runtimeUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:8200/api/copilotkit"
    : "http://localhost:8200/api/copilotkit";

export default function App() {
  return (
    <CopilotKitProvider runtimeUrl={runtimeUrl}> {}
      <ChatScreen />
    </CopilotKitProvider>
  );
}

