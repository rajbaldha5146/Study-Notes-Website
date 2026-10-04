import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Code,
  FileCode,
  Link,
  List,
  CheckSquare,
  Quote,
  Table,
} from "lucide-react";

export default function MarkdownToolbar({ textareaRef, content, onChange }) {
  const insertFormatting = (prefix, suffix = "", defaultText = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const newContent =
      content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      content.substring(end);

    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const tools = [
    {
      icon: Bold,
      title: "Bold",
      action: () => insertFormatting("**", "**", "bold text"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => insertFormatting("*", "*", "italic text"),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => insertFormatting("## ", "", "Heading"),
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => insertFormatting("### ", "", "Subheading"),
    },
    {
      icon: Code,
      title: "Inline Code",
      action: () => insertFormatting("`", "`", "code"),
    },
    {
      icon: FileCode,
      title: "Code Block",
      action: () => insertFormatting("```javascript\n", "\n```", "// code here"),
    },
    {
      icon: Link,
      title: "Link",
      action: () => insertFormatting("[", "](https://example.com)", "Link text"),
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => insertFormatting("- ", "", "List item"),
    },
    {
      icon: CheckSquare,
      title: "Task List",
      action: () => insertFormatting("- [ ] ", "", "Task item"),
    },
    {
      icon: Quote,
      title: "Quote",
      action: () => insertFormatting("> ", "", "Quote text"),
    },
    {
      icon: Table,
      title: "Table",
      action: () =>
        insertFormatting(
          "\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n",
          ""
        ),
    },
  ];

  return (
    <div
      className="flex items-center gap-1 p-2 overflow-x-auto border-b"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {tools.map((tool, idx) => (
        <button
          key={idx}
          type="button"
          onClick={tool.action}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          title={tool.title}
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
