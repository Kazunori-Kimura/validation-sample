"use client";

import NumericInput from "@/shared/components/NumericInput";
import {
  FunctionKey,
  FunctionKeys,
  useFunctionKeys,
} from "@/shared/hooks/useFunctionKeys";
import { useCallback, useRef, useState } from "react";
import GitHubButton from "react-github-btn";

export default function PageView() {
  // ファンクションキーに対応するボタンへの参照を管理するためのref
  const buttonsRef = useRef<Partial<Record<FunctionKey, HTMLButtonElement>>>(
    {},
  );
  // どのボタンがクリックされたかを管理するためのステート
  const [clickedButton, setClickedButton] = useState<number | null>(null);

  // 数値入力の値を管理するためのステート
  const [value, setValue] = useState("");

  // ファンクションキーが押されたときに対応するボタンをクリックする
  const handleFunctionButtonClick = useCallback((functionKey: FunctionKey) => {
    const button = buttonsRef.current[functionKey];
    if (button) {
      button.click();
    }
  }, []);

  // useFunctionKeysフックを使用して、F1-F12キーが押されたときに対応する関数を呼び出す
  useFunctionKeys({
    F1: () => handleFunctionButtonClick("F1"),
    F2: () => handleFunctionButtonClick("F2"),
    F3: () => handleFunctionButtonClick("F3"),
    F4: () => handleFunctionButtonClick("F4"),
    F5: () => handleFunctionButtonClick("F5"),
    F6: () => handleFunctionButtonClick("F6"),
    F7: () => handleFunctionButtonClick("F7"),
    F8: () => handleFunctionButtonClick("F8"),
    F9: () => handleFunctionButtonClick("F9"),
    F10: () => handleFunctionButtonClick("F10"),
    F11: () => handleFunctionButtonClick("F11"),
    F12: () => handleFunctionButtonClick("F12"),
  });

  return (
    <div className="flex flex-1 flex-col w-full justify-center p-8 bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 flex-col gap-y-4 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-row gap-x-4 items-start">
          <a
            href="https://github.com/Kazunori-Kimura/validation-sample"
            className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-zinc-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
          <GitHubButton
            href="https://github.com/Kazunori-Kimura/validation-sample"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-icon="octicon-star"
            data-size="large"
            aria-label="Star Kazunori-Kimura/validation-sample on GitHub"
          >
            Star
          </GitHubButton>
        </div>
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          数値入力とファンクションキーのデモ
        </h1>
        <h2 className="text-xl font-medium leading-8 tracking-tight text-gray-700 dark:text-gray-300">
          ime_input
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          全角数値を半角数値に強制変換し、数値以外の入力を拒否します。
        </p>
        <NumericInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onCompositionEnd={(e) => setValue(e.currentTarget.value)}
        />

        <hr />

        <h2 className="text-xl font-medium leading-8 tracking-tight text-gray-700 dark:text-gray-300">
          shortcut
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          F1-F12キーを押すと、対応するボタンがクリックされます。
        </p>

        <div className="flex flex-row flex-wrap gap-4">
          {FunctionKeys.map((fk, index) => (
            <StyledButton
              key={fk}
              ref={(el) => {
                if (el) {
                  buttonsRef.current[fk] = el;
                }
              }}
              onClick={() => setClickedButton(index + 1)}
            >
              {`ボタン ${index + 1} (${fk})`}
            </StyledButton>
          ))}
        </div>
        {clickedButton && (
          <p className="text-green-500 text-sm mt-1">
            ボタン {clickedButton} がクリックされました！
          </p>
        )}
      </main>
    </div>
  );
}

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}

function StyledButton({
  children,
  className,
  ref,
  ...props
}: StyledButtonProps) {
  return (
    <button
      ref={ref}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
