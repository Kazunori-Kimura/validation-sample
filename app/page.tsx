import PageView from "@/features/home/components/PageView";
import Explanation from "@/shared/components/Explanation";

export default function Home() {
  return (
    <div className="flex h-screen min-h-0 w-full flex-1 flex-row justify-center overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <PageView />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Explanation />
      </div>
    </div>
  );
}
