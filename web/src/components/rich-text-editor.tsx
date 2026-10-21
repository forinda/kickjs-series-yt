import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { FileHandler } from "@tiptap/extension-file-handler";
import { Markdown } from "@tiptap/markdown";
import { common, createLowlight } from "lowlight";
import { toast } from "sonner";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconCode,
  IconColumnInsertRight,
  IconColumnRemove,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconLoader2,
  IconMarkdown,
  IconMinus,
  IconPhoto,
  IconRowInsertBottom,
  IconRowRemove,
  IconSourceCode,
  IconStrikethrough,
  IconTable,
  IconTableOff,
  IconTableRow,
  IconTextCaption,
  IconUnderline,
  type Icon,
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toArticleHtml } from "@/lib/article-html";
import { CODE_LANGUAGES } from "@/lib/code-languages";
import { extractError } from "@/lib/api";
import { useUploadArticleImage } from "@/features/blogs/mutations";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"]; // server allow-list
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const lowlight = createLowlight(common);

// Plain-text paste that's probably Markdown: headings, lists, quotes, fences, bold, links, tables.
const looksLikeMarkdown = (text: string) =>
  /^(#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s|>\s|```|\|.+\|)/m.test(text) ||
  /\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)/.test(text);

type Props = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
};

type Tool = {
  label: string;
  icon: Icon;
  run: (e: Editor) => void;
  active?: (e: Editor) => boolean;
};

// Keep in sync with the server allow-list in server/src/modules/articles/article-html.ts.
const toolGroups: Tool[][] = [
  [
    { label: "Heading 2", icon: IconH2, run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e) => e.isActive("heading", { level: 2 }) },
    { label: "Heading 3", icon: IconH3, run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e) => e.isActive("heading", { level: 3 }) },
  ],
  [
    { label: "Bold", icon: IconBold, run: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive("bold") },
    { label: "Italic", icon: IconItalic, run: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive("italic") },
    { label: "Underline", icon: IconUnderline, run: (e) => e.chain().focus().toggleUnderline().run(), active: (e) => e.isActive("underline") },
    { label: "Strikethrough", icon: IconStrikethrough, run: (e) => e.chain().focus().toggleStrike().run(), active: (e) => e.isActive("strike") },
    { label: "Inline code", icon: IconCode, run: (e) => e.chain().focus().toggleCode().run(), active: (e) => e.isActive("code") },
  ],
  [
    { label: "Bullet list", icon: IconList, run: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive("bulletList") },
    { label: "Numbered list", icon: IconListNumbers, run: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive("orderedList") },
    { label: "Quote", icon: IconBlockquote, run: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive("blockquote") },
    { label: "Code block", icon: IconSourceCode, run: (e) => e.chain().focus().toggleCodeBlock().run(), active: (e) => e.isActive("codeBlock") },
    { label: "Divider", icon: IconMinus, run: (e) => e.chain().focus().setHorizontalRule().run() },
    { label: "Insert table", icon: IconTable, run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  ],
];

// Shown only while the cursor is inside a table.
const tableTools: Tool[] = [
  { label: "Add row below", icon: IconRowInsertBottom, run: (e) => e.chain().focus().addRowAfter().run() },
  { label: "Add column right", icon: IconColumnInsertRight, run: (e) => e.chain().focus().addColumnAfter().run() },
  { label: "Delete row", icon: IconRowRemove, run: (e) => e.chain().focus().deleteRow().run() },
  { label: "Delete column", icon: IconColumnRemove, run: (e) => e.chain().focus().deleteColumn().run() },
  { label: "Toggle header row", icon: IconTableRow, run: (e) => e.chain().focus().toggleHeaderRow().run() },
  { label: "Delete table", icon: IconTableOff, run: (e) => e.chain().focus().deleteTable().run() },
];

const iconButton = "size-8";
const contextBar = "flex flex-wrap items-center gap-2 border-b bg-muted/20 px-2 py-1";

export default function RichTextEditor({ value, onChange, onBlur, placeholder, invalid }: Props) {
  const [linkUrl, setLinkUrl] = useState<string | null>(null); // null = link bar closed
  const [markdown, setMarkdown] = useState<string | null>(null); // null = rich-text mode
  const uploadImage = useUploadArticleImage();
  const editorRef = useRef<Editor | null>(null);

  /** Validate, upload, insert at `pos` (drop point) or the cursor. */
  const uploadImages = async (editor: Editor, files: File[], pos?: number) => {
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: use a PNG, JPEG, GIF, WebP or AVIF image.`);
        continue;
      }
      if (file.size > IMAGE_MAX_BYTES) {
        toast.error(`${file.name}: images must be 5 MB or smaller.`);
        continue;
      }
      try {
        const { src } = await uploadImage.mutateAsync(file);
        const node = { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "") } };
        if (pos === undefined) editor.chain().focus().insertContent(node).run();
        else editor.chain().focus().insertContentAt(pos, node).run();
      } catch (error) {
        toast.error(extractError(error, `Could not upload ${file.name}.`));
      }
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }, // the article title is the page's h1
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        codeBlock: false, // replaced by the highlighting version below
      }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing… Markdown shortcuts and pasting Markdown work too." }),
      Image,
      TableKit.configure({ table: { resizable: false } }), // widths aren't kept by the server anyway
      Markdown,
      FileHandler.configure({
        allowedMimeTypes: IMAGE_TYPES,
        consumePasteEvent: true,
        onDrop: (e, files, pos) => void uploadImages(e, files, pos),
        onPaste: (e, files) => void uploadImages(e, files),
      }),
    ],
    content: toArticleHtml(value),
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none min-h-[28rem] px-4 py-3 focus:outline-none",
      },
      // Pasted plain text that looks like Markdown becomes formatted content.
      handlePaste: (_view, event) => {
        const data = event.clipboardData;
        const text = data?.getData("text/plain") ?? "";
        if (!editorRef.current || data?.files.length || data?.getData("text/html") || !looksLikeMarkdown(text)) {
          return false; // files → FileHandler, HTML → Tiptap's own paste
        }
        editorRef.current.commands.insertContent(text, { contentType: "markdown" });
        return true;
      },
    },
    // An empty editor still holds "<p></p>"; report "" so required-field validation works.
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur?.(),
  });
  useEffect(() => {
    editorRef.current = editor; // read by handlePaste, which is fixed at editor creation
  }, [editor]);

  // Toolbar state re-renders only when what it shows changes, not on every keystroke.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      active: toolGroups.flat().map((t) => t.active?.(e) ?? false),
      link: e.isActive("link"),
      inTable: e.isActive("table"),
      image: e.isActive("image") ? ((e.getAttributes("image").alt as string | undefined) ?? "") : null,
      codeLanguage: e.isActive("codeBlock") ? ((e.getAttributes("codeBlock").language as string | null) ?? "plaintext") : null,
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  // Value replaced from outside (e.g. the saved article loads, or the form resets).
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) editor.commands.setContent(toArticleHtml(value), { emitUpdate: false });
  }, [editor, value]);

  const applyLink = () => {
    const url = linkUrl?.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url) chain.setLink({ href: /^(https?:|mailto:)/i.test(url) ? url : `https://${url}` }).run();
    else chain.unsetLink().run();
    setLinkUrl(null);
  };

  const onImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])];
    e.target.value = ""; // allow re-picking the same file
    void uploadImages(editor, files);
  };

  // Markdown mode edits the source; every change flows through the editor so the
  // form value (HTML) stays current and switching back is lossless.
  const toggleMarkdown = () => {
    if (markdown === null) setMarkdown(editor.getMarkdown());
    else setMarkdown(null);
  };
  const onMarkdownChange = (next: string) => {
    setMarkdown(next);
    editor.commands.setContent(next, { contentType: "markdown" });
  };

  let toolIndex = 0;
  return (
    <div
      className={`overflow-hidden rounded-lg border transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 ${invalid ? "border-destructive" : "border-input"}`}
    >
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
        {markdown === null && (
          <>
            {toolGroups.map((group, g) => (
              <div key={g} className="flex items-center gap-0.5 border-r pr-1 last:border-r-0">
                {group.map((tool) => {
                  const i = toolIndex++;
                  const ToolIcon = tool.icon;
                  return (
                    <Button
                      key={tool.label}
                      type="button"
                      size="icon"
                      variant={state.active[i] ? "secondary" : "ghost"}
                      className={iconButton}
                      aria-label={tool.label}
                      aria-pressed={tool.active ? state.active[i] : undefined}
                      title={tool.label}
                      onClick={() => tool.run(editor)}
                    >
                      <ToolIcon className="size-4" />
                    </Button>
                  );
                })}
              </div>
            ))}
            <Button type="button" size="icon" variant="ghost" className={iconButton} asChild disabled={uploadImage.isPending}>
              <label title="Insert image (or drop / paste one)" aria-label="Insert image" className="cursor-pointer">
                {uploadImage.isPending ? <IconLoader2 className="size-4 animate-spin" /> : <IconPhoto className="size-4" />}
                <input type="file" accept={IMAGE_TYPES.join(",")} multiple className="sr-only" disabled={uploadImage.isPending} onChange={onImagePicked} />
              </label>
            </Button>
            <Button
              type="button"
              size="icon"
              variant={state.link ? "secondary" : "ghost"}
              className={iconButton}
              aria-label="Link"
              aria-pressed={state.link}
              title="Link"
              onClick={() => setLinkUrl(editor.getAttributes("link").href ?? "")}
            >
              <IconLink className="size-4" />
            </Button>
          </>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            size="sm"
            variant={markdown === null ? "ghost" : "secondary"}
            className="h-8 gap-1.5"
            aria-pressed={markdown !== null}
            title={markdown === null ? "Edit as Markdown" : "Back to rich text"}
            onClick={toggleMarkdown}
          >
            {markdown === null ? <IconMarkdown className="size-4" /> : <IconTextCaption className="size-4" />}
            {markdown === null ? "Markdown" : "Rich text"}
          </Button>
          {markdown === null && (
            <>
              <Button type="button" size="icon" variant="ghost" className={iconButton} aria-label="Undo" title="Undo" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
                <IconArrowBackUp className="size-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className={iconButton} aria-label="Redo" title="Redo" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
                <IconArrowForwardUp className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {markdown === null && state.inTable && (
        <div role="toolbar" aria-label="Table" className={contextBar}>
          <span className="text-xs text-muted-foreground">Table</span>
          {tableTools.map(({ label, icon: ToolIcon, run }) => (
            <Button key={label} type="button" size="icon" variant="ghost" className={iconButton} aria-label={label} title={label} onClick={() => run(editor)}>
              <ToolIcon className="size-4" />
            </Button>
          ))}
        </div>
      )}

      {markdown === null && state.codeLanguage !== null && (
        <div className={contextBar}>
          <label htmlFor="code-language" className="text-xs text-muted-foreground">
            Code language
          </label>
          <select
            id="code-language"
            value={state.codeLanguage}
            onChange={(e) => editor.chain().focus().updateAttributes("codeBlock", { language: e.target.value }).run()}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {CODE_LANGUAGES.map(([lang, label]) => (
              <option key={lang} value={lang}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {markdown === null && state.image !== null && (
        <div className={contextBar}>
          <label htmlFor="image-alt" className="shrink-0 text-xs text-muted-foreground">
            Alt text
          </label>
          <Input
            id="image-alt"
            value={state.image}
            placeholder="Describe the image for screen readers"
            onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value }).run()}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} // don't submit the article form
            className="h-8"
          />
        </div>
      )}

      {markdown === null && linkUrl !== null && (
        <div className={contextBar}>
          <Input
            autoFocus
            type="url"
            value={linkUrl}
            placeholder="https://example.com (leave empty to remove the link)"
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // don't submit the article form
                applyLink();
              }
              if (e.key === "Escape") setLinkUrl(null);
            }}
            className="h-8"
          />
          <Button type="button" size="sm" onClick={applyLink}>
            Apply
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setLinkUrl(null)}>
            Cancel
          </Button>
        </div>
      )}

      {markdown !== null && (
        <textarea
          aria-label="Markdown source"
          value={markdown}
          onChange={(e) => onMarkdownChange(e.target.value)}
          onBlur={() => onBlur?.()}
          spellCheck={false}
          className="block min-h-[28rem] w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none"
        />
      )}
      <div hidden={markdown !== null}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
