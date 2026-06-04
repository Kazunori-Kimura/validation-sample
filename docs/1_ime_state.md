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
