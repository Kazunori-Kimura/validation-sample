"use client";

import { useEffect } from "react";

export const FunctionKeys = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
] as const;

export type FunctionKey = (typeof FunctionKeys)[number];

export type FunctionKeyMap = Partial<Record<FunctionKey, () => void>>;

interface UseFunctionKeysOptions {
  /**
   * 入力中もショートカットを有効にするか
   * デフォルト: false
   */
  enableInInput?: boolean;
}

export function useFunctionKeys(
  shortcuts: FunctionKeyMap,
  options: UseFunctionKeysOptions = {},
) {
  const { enableInInput = false } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // --------------------
      // IME変換中
      // --------------------
      if (event.isComposing) {
        return;
      }

      // Safari / 一部ブラウザ対策
      // keyCode 229 は IME 変換中を示す
      // ただし、keyCode は非推奨であり、将来的には削除される可能性があるため注意
      if (event.keyCode === 229) {
        return;
      }

      // --------------------
      // 入力コントロール判定
      // --------------------
      if (!enableInInput) {
        const target = event.target as HTMLElement | null;

        if (target) {
          const tagName = target.tagName.toUpperCase();

          const isInputElement =
            tagName === "INPUT" ||
            tagName === "TEXTAREA" ||
            tagName === "SELECT";

          if (isInputElement || target.isContentEditable) {
            return;
          }
        }
      }

      // --------------------
      // ショートカット実行
      // --------------------
      const action = shortcuts[event.key as FunctionKey];

      if (!action) {
        return;
      }

      event.preventDefault();
      action();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, enableInInput]);
}
