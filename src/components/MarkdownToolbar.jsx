import React from "react";
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

  const toolGroups = [
    [
      { icon: Bold, title: "Bold (Ctrl+B)", action: () => insertFormatting("**", "**", "bold text") },
      { icon: Italic, title: "Italic (Ctrl+I)", action: () => insertFormatting("*", "*", "italic text") },
    ],
    [
      { icon: Heading2, title: "Heading 2", action: () => insertFormatting("## ", "", "Heading") },
      { icon: Heading3, title: "Heading 3", action: () => insertFormatting("### ", "", "Subheading") },
    ],
    [
      { icon: Code, title: "Inline Code", action: () => insertFormatting("`", "`", "code") },
      { icon: FileCode, title: "Code Block", action: () => insertFormatting("```javascript\n", "\n```", "// code here") },
    ],
    [
      { icon: Link, title: "Link", action: () => insertFormatting("[", "](https://example.com)", "Link text") },
      { icon: List, title: "Bullet List", action: () => insertFormatting("- ", "", "List item") },
      { icon: CheckSquare, title: "Task List", action: () => insertFormatting("- [ ] ", "", "Task item") },
    ],
    [
      { icon: Quote, title: "Quote", action: () => insertFormatting("> ", "", "Quote text") },
      {
        icon: Table,
        title: "Table",
        action: () =>
          insertFormatting(
            "\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n",
            ""
          ),
      },
    ],
  ];

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto border-b"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {toolGroups.map((group, groupIdx) => (
        <React.Fragment key={groupIdx}>
          {groupIdx > 0 && (
            <div
              className="h-4 w-px mx-0.5 flex-shrink-0"
              style={{ background: "var(--border-subtle)" }}
            />
          )}
          <div className="flex items-center gap-0.5">
            {group.map((tool, toolIdx) => (
              <button
                key={toolIdx}
                type="button"
                onClick={tool.action}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: "var(--text-muted)", background: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
                title={tool.title}
              >
                <tool.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
