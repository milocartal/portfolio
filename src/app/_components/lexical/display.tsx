"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import { TRANSFORMERS } from "@lexical/markdown";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";

import type { LexicalEditor } from "lexical";
import { useMemo } from "react";

export type LexicalReadOnlyProps = {
  initialContent?: string; // Lexical serialized state object
  placeholder?: string;
};

const theme = {
  paragraph: "mb-3",
  quote: "border-l-4 pl-3 italic text-gray-700",
  heading: {
    h1: "text-3xl font-semibold mb-3",
    h2: "text-2xl font-semibold mb-3",
    h3: "text-xl font-semibold mb-2",
  },
  list: {
    ul: "list-disc pl-6 mb-3",
    ol: "list-decimal pl-6 mb-3",
    listitem: "mb-1",
  },
  code: "font-mono text-sm bg-gray-100 rounded p-2 block mb-3 overflow-x-auto",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono bg-gray-100 rounded px-1",
  },
  link: "text-blue-600 underline underline-offset-2",
  // Ajoute d'autres classes si besoin
};

function onError(error: Error) {
  console.error(error);
}

export function CustomLexicalReadOnly({
  initialContent = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
  placeholder = "Aucun contenu disponible",
}: LexicalReadOnlyProps) {
  const initialConfig = useMemo(
    () => ({
      namespace: "racoon-readonly",
      theme,
      onError,
      editable: false,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        CodeNode,
      ],
      editorState: (editor: LexicalEditor) => {
        if (initialContent) {
          const state = editor.parseEditorState(initialContent);
          editor.setEditorState(state);
        }
      },
    }),
    [initialContent],
  );

  return (
    <div className="w-full p-3">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="prose outline-none" />}
          placeholder={
            <div className="pointer-events-none inset-0 overflow-hidden text-gray-400 select-none">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </LexicalComposer>
    </div>
  );
}
