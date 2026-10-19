/**
 * @format
 */

import "react-native-get-random-values"; // secure RNG — must be first
import "@copilotkit/react-native/polyfills";

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
