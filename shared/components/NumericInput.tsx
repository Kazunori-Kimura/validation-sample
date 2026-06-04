import { useRef, useState, useMemo, useEffect } from "react";

type NumericInputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * 数値入力コンポーネント
 */
export default function NumericInput({
  onCompositionEnd,
  className,
  ...props
}: NumericInputProps) {
  // 入力フィールドへの参照
  const inputRef = useRef<HTMLInputElement>(null);
  // 入力中の文字列が確定していないかどうかを追跡するためのref
  const isComposingRef = useRef(false);

  // エラー状態を管理するためのステート
  const [error, setError] = useState<string | null>(null);

  // 現在の入力値を文字列として取得
  const currentValue =
    typeof props.value === "string" ? props.value : `${props.value ?? ""}`;
  // エラー状態を計算
  const isInvalid = useMemo(() => {
    return error?.length ?? 0 > 0;
  }, [error]);

  // 入力値が変更されるたびに、バリデーションを実行してエラー状態を更新
  useEffect(() => {
    let valid = true;
    if (inputRef.current && !isComposingRef.current) {
      if (!inputRef.current.validity.valid) {
        setError(inputRef.current.validationMessage);
        valid = false;
      }
    }

    if (valid) {
      setError(null);
    }
  }, [currentValue]);

  return (
    <div className="flex flex-col items-start w-full">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={`border rounded px-2 py-1 focus:outline-none focus:ring-2 ${
          isInvalid
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        } ${className ?? ""}`}
        placeholder="数値を入力してください"
        onCompositionStart={() => {
          // 入力が確定していない状態になったので、フラグを立てる
          isComposingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          // 入力が確定したので、フラグをリセット
          isComposingRef.current = false;
          
          const input = e.currentTarget;

          // 全角数字を半角に変換
          const value = input.value.replace(/[０-９]/g, (char) =>
            String.fromCharCode(char.charCodeAt(0) - 0xfee0),
          );

          // 数値以外の文字が含まれていないかをチェックし、含まれている場合は空文字にする
          input.value = /^\d*$/.test(value) ? value : "";

          onCompositionEnd?.(e);
        }}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
