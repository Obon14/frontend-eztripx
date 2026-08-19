import type { LegalMdBlock } from "@/types/legal";

/** Conservative markdown: headings (##), paragraphs, and dash lists. No HTML. */
export function parseLegalMarkdown(src: string): LegalMdBlock[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: LegalMdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }

    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith("- ")) {
        items.push((lines[i] ?? "").trim().slice(2).trim());
        i += 1;
      }
      if (items.length > 0) blocks.push({ type: "ul", items });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() !== "" &&
      !(lines[i] ?? "").startsWith("## ") &&
      !(lines[i] ?? "").trim().startsWith("- ")
    ) {
      para.push((lines[i] ?? "").trim());
      i += 1;
    }
    if (para.length > 0) {
      blocks.push({ type: "p", text: para.join(" ") });
    }
  }

  return blocks;
}
