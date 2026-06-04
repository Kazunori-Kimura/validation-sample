## ショートカットキーの実装について

React において ファンクションキー (F1〜F12) が押された場合に、対応する処理を実行する実装について解説します。

React では、window に対して keydown イベントを登録し、event.key が F1〜F12 の場合に対応するボタンの処理を呼び出すのが一般的です。


### ボタンのクリックイベントを直接発火する方法

ショートカットキーに対応したい `button` の `ref` (参照) を保持しておきます。
`window` の `keydown` イベントで該当キーが押下された場合に `click()` を実行します。

`preventDefault()` メソッドによって、あらかじめ標準で割り当てられている処理をキャンセルすることが可能です。

ただし、mac の場合は `F11` キーが OS によって **デスクトップの表示** 機能に割り当てられており、JavaScript からはこれをキャンセルすることはできません。
Windows でも OS 側で割り当てられている機能については `preventDefault()` メソッドではキャンセルできないかもしれません（*要検証*）

```tsx
import { useEffect, useRef } from "react";

export default function App() {
  const f1ButtonRef = useRef<HTMLButtonElement>(null);
  const f2ButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "F1":
          event.preventDefault();
          f1ButtonRef.current?.click();
          break;
        case "F2":
          event.preventDefault();
          f2ButtonRef.current?.click();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <>
      <button
        ref={f1ButtonRef}
        onClick={() => console.log("F1 button clicked")}
      >
        F1
      </button>
      <button
        ref={f2ButtonRef}
        onClick={() => console.log("F2 button clicked")}
      >
        F2
      </button>
    </>
  );
}
```


### F1〜F12 をまとめて管理する方法

`shared/hooks/useFunctionKeys.ts` の `useFunctionKeys` カスタムフックはファンクションキーをショートカットに割り当てるサンプル実装です。
以下のように画面に組み込むと、F1〜F12 キーに任意の処理を割り当てられます。

`features/home/components/PageView.tsx` から一部抜粋

```tsx
export default function PageView() {
  // ファンクションキーに対応するボタンへの参照を管理するためのref
  const buttonsRef = useRef<Partial<Record<FunctionKey, HTMLButtonElement>>>({});
  // どのボタンがクリックされたかを管理するためのステート
  const [clickedButton, setClickedButton] = useState<number | null>(null);
  
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
      <main className="flex flex-1 flex-col gap-y-8 bg-white dark:bg-black sm:items-start">
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

```
