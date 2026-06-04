# validation-sample

## IME （日本語入力 ON/OFF） を制御する

React の Web アプリで IME（日本語入力 ON/OFF）を完全に制御することはできません。

これはブラウザのセキュリティ・ユーザー体験上の制約で、JavaScript から直接「日本語入力を ON にする」「OFF にする」という API は提供されていません。

---

### 1. 昔の `ime-mode`

昔は CSS の `ime-mode` がありました。

```css
input {
  ime-mode: inactive;
}
input {
  ime-mode: active;
}
```

しかしこれは既に廃止されており、Chrome・Safari ではサポートされていません。新規実装には使用しない方が良いです。


### 2. 数値入力などで IME を使わせたくない場合

最も一般的な方法です。

```html
<input
  type="number"
  placeholder="数値のみ"
/>
```

または

```html
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
/>
```

`inputMode` は仮想キーボードの種類をブラウザへ通知します。特にスマホでは数字キーボードが表示されます。
`pattern` は入力値が正規表現（RegExp）に一致するかをブラウザが検証するための仕組みです。

---

### 3. フォーカス時に IME 状態を監視する

React では IME の変換開始・終了を検知できます。

```tsx
import { useState } from "react";
export default function Sample() {
  const [isComposing, setIsComposing] = useState(false);
  return (
    <input
      onCompositionStart={() => {
        console.log("IME開始");
        setIsComposing(true);
      }}
      onCompositionEnd={() => {
        console.log("IME終了");
        setIsComposing(false);
      }}
      onChange={(e) => {
        console.log(e.target.value);
      }}
    />
  );
}
```

日本語入力中

```
k
ka
kan
kanj
```

のような途中状態では `isComposing === true` となります。

変換確定後

```
漢字
```

で `onCompositionEnd` が発生します。

⸻


### 4. 実装例

#### 郵便番号

```html
<input
  type="text"
  inputMode="numeric"
  maxLength={7}
/>
```

#### 電話番号

```html
<input
  type="tel"
  inputMode="tel"
/>
```

#### メールアドレス

```html
<input
  type="email"
  inputMode="email"
  autoCapitalize="off"
  autoCorrect="off"
/>
```

#### ユーザー名（英数字のみ）

```html
<input
  type="text"
  inputMode="latin"
  autoCapitalize="off"
/>
```

`inputMode="latin"` とすると、スマートフォンなどでブラウザがアルファベット入力用のキーボードを表示します。

#### React での数値入力コンポーネント

`shared/components/NumericInput.tsx` は数値入力コンポーネントのサンプル実装です。
IME が有効な状態で全角数字を入力された場合、IME変換確定後に半角数字に自動変換しています。

---

現在の React / Chrome 環境では、

* IME ON/OFF の直接制御 → 不可
* IME入力中かどうかの判定 → 可能
  - 日本語変換中・確定の判定 → `isComposing`
* 数字キーボードや英字キーボードの誘導 → `inputMode`

という方針で実装するのが一般的です。

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

