# CopilotKit React Native — Feature Testing Guide

All code added here is copied from the CopilotKit docs:

- Quickstart: https://docs.copilotkit.ai/react-native
- `useFrontendTool`: https://docs.copilotkit.ai/reference/react-native/hooks/useFrontendTool
- `useHumanInTheLoop`: https://docs.copilotkit.ai/reference/react-native/hooks/useHumanInTheLoop
- `useRenderTool` / `useRenderToolCall`: https://docs.copilotkit.ai/reference/react-native/hooks/useRenderTool

The reference pages import from `@copilotkit/react-native` (the root barrel). Here they import from
`@copilotkit/react-native/headless` instead. The quickstart says that is the only change needed, and
it means Metro never has to resolve `expo-document-picker` / `expo-file-system`.

## What was added

| File | Feature | Source in docs |
|------|---------|----------------|
| `src/tools/TodoManager.tsx` | Frontend tool `addTodo`: the handler runs on the device and updates React state | useFrontendTool → "Basic Tool with Zod Parameters" |
| `src/tools/ShowWeather.tsx` | Generative UI: frontend tool `showWeather` with a `render` typed as `FrontendToolRenderFunction` | useFrontendTool → "The render type React Native needs" |
| `src/tools/DeleteConfirmation.tsx` | Human-in-the-loop `confirmDeletion` with Delete / Cancel buttons | useHumanInTheLoop → "Confirmation Dialog" |
| `src/tools/WildcardRenderer.tsx` | `useRenderTool({ name: "*" })` fallback renderer for tool calls that have no renderer of their own | useRenderTool → "Wildcard fallback" |
| `src/ToolCallStage.tsx` | Draws registered tool-call UI inside the custom (headless) chat, using `useRenderToolCall` | useRenderTool → "Rendering a tool call outside the chat" |
| `src/ChatScreen.tsx` | Mounts the five components above, between the message list and the input row | — |
| `metro.config.js` | Resolves `jose` against its `browser` build so release bundles don't fail on `node:crypto` | Quickstart → "Metro configuration for release bundles" |
| `package.json` | Adds `zod` (optional peer dependency, used for tool `parameters`) | Quickstart → "Frontend tools and generative UI" |

> **Why `ToolCallStage` is needed:** the chat in `ChatScreen.tsx` is headless and only shows text messages.
> A `render` passed to a tool hook goes into a registry that only the prebuilt `/components` chat
> reads on its own. In a custom UI you have to call `useRenderToolCall()` yourself to draw that UI.
> `ToolCallStage` does this, so tool UIs appear in their own area above the input box, separate from the text messages.

## 0. Start everything

Terminal 1, the runtime:

```bash
export OPENAI_API_KEY=sk-...
npx tsx src/api/copilotkit/server.ts
```

Terminal 2, Metro and the app:

```bash
npx react-native start --reset-cache
npx react-native run-android   # or: npx react-native run-ios
```

Sanity check: `http://localhost:8200/api/copilotkit/info` should list the `default` agent.
You can also run the docs' round-trip check:

```bash
npx copilotkit verify --round-trip --runtime-url http://localhost:8200/api/copilotkit
```

**Physical Android device over USB:** run `adb reverse tcp:8200 tcp:8200` first.

---

## 1. Frontend tool — `addTodo` (`TodoManager`)

**Prompt:** `Add a high priority todo to buy milk`

**Expected**
- The text `buy milk` appears in the todo list above the input box. The handler ran on the device and updated React state.
- `addTodo` has no `render` of its own, so the wildcard renderer (§4) shows `⏳ addTodo` in the tool area, then `✓ addTodo`.
- The assistant replies to confirm. The handler's return value was `Added "buy milk" with high priority`.

**Also try:** `Add two todos: call mom (low) and pay rent (high)`. Both items should appear.

## 2. Generative UI — `showWeather` (`ShowWeather`)

**Prompt:** `Show the weather in Berlin for today - 33 deg F`

**Expected**
- The tool area shows a `<Text>` reading `Berlin`. This is the `renderWeather` component, drawn from the agent's tool-call args.
- The name fills in as the args stream (`args` is partial while the status is `inProgress`).
- The handler returns the city string. There is no real weather data; the docs example is intentionally minimal.

**Type-safety check (optional):** in `ShowWeather.tsx`, change the renderer to return a bare string
(`({ args }) => \`Weather in ${args.city}\``) and run `npx tsc --noEmit`. It should fail with
`TS2322`, because `FrontendToolRenderFunction` narrows the return type to `ReactElement | null`. Revert afterwards.

## 3. Human-in-the-loop — `confirmDeletion` (`DeleteConfirmation`)

**Prompt:** `Delete 3 old photos` (if the model doesn't call the tool, try: `Ask me to confirm deleting 3 photos`)

**Expected**
1. While the args stream (`InProgress`), the tool area shows **"Preparing confirmation..."**.
2. Once the args are complete (`Executing`), a bordered card reads **"Are you sure you want to delete 3 photos(s)?"**
   and has a red **Delete** button and a grey **Cancel** button. The agent stays paused (`isRunning` is still true).
3. Tap **Delete**. The card is replaced by **"Items deleted."**, and the agent resumes and replies.
4. Repeat, and tap **Cancel** this time. You should see **"Deletion cancelled."**, and the assistant should say it was cancelled.

## 4. Wildcard renderer — `useRenderTool({ name: "*" })` (`WildcardRenderer`)

This covers any tool call that has no exact-name renderer. In this app that is only `addTodo`.

**Test:** run the prompt from §1. The tool area shows `⏳ addTodo`, which changes to `✓ addTodo` once the tool result message arrives.

**Expected dev warning:** React Native's `useRenderTool` is a deprecated compatibility shim, per the docs.
You may see a `[CopilotKit] useRenderTool(...)` warning in the Metro logs. This is expected and doesn't mean anything is broken.

## 5. Tool-call rendering in the custom chat (`ToolCallStage`)

This is exercised by §1–§4. What to check:
- Each tool call gets exactly one UI element, keyed by tool-call id, with no duplicates.
- The UI moves from in progress to complete. The complete state is selected when a matching `tool` result message exists.
- Tool-call UIs from earlier turns stay visible, because the stage reads the whole message list.

## 6. Release bundle / Metro `jose` fix

```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output /tmp/out.bundle
```

**Expected:** the bundle builds with no `Unable to resolve module node:crypto` error pointing at `jose`.

## 7. Proof on device (from the docs' "Proving it works")

```bash
adb devices                                   # confirm one booted target
adb exec-out screencap -p > proof.png         # capture the rendered screen
adb logcat -d -s ReactNativeJS:E              # no unresolved redbox
```

iOS simulator: `xcrun simctl io booted screenshot proof.png` (requires full Xcode).

## Troubleshooting (from the docs)

- **Metro can't resolve modules:** `npx react-native start --reset-cache`
- **No response:** make sure the runtime is running and that the device can reach the `runtimeUrl` in `App.tsx`
  (Android emulator → `10.0.2.2`, iOS simulator → `localhost`, physical device → your LAN IP).
- **Model auth errors:** `OPENAI_API_KEY` must be set in the terminal that runs the server.
- **"Text strings must be rendered within a `<Text>` component":** a tool `render` returned a bare string.
  Return an element or `null`.
