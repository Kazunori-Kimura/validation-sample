import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

interface DocContent {
  fileName: string;
  title: string;
  html: string;
}

async function parseMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}

export default async function Explanation() {
  const docsDir = path.join(process.cwd(), "docs");
  const fileNames = (await readdir(docsDir))
    .filter((fileName) => fileName.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "ja"));

  const docs: DocContent[] = await Promise.all(
    fileNames.map(async (fileName) => {
      const markdown = await readFile(path.join(docsDir, fileName), "utf-8");
      const html = await parseMarkdown(markdown);
      const title = fileName.replace(/\.md$/i, "").replace(/^\d+_?/, "");

      return {
        fileName,
        title: title || fileName,
        html,
      };
    }),
  );

  return (
    <section className="explanation-panel flex h-full min-h-0 w-full flex-col bg-white p-8 dark:bg-black">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">解説</h2>
      <div className="flex flex-col gap-8">
        {docs.map((doc) => (
          <article key={doc.fileName} className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-700">
            <h3 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">{doc.title}</h3>
            <div
              className="explanation-content"
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
