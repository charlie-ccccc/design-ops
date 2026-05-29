'use client';
import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { List, ListOrdered, Link as LinkIcon, Unlink } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, minHeight = 200, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px; outline:none; padding: 10px 12px; font-size:14px; line-height:1.6; font-family:inherit;`,
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('輸入連結 URL', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    const href = url.startsWith('http') ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
  }, [editor]);

  if (!editor) return null;

  const ToolBtn = ({ active, disabled, onClick, title, children }: {
    active?: boolean; disabled?: boolean; onClick: () => void; title: string; children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 5, border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : disabled ? 'var(--muted-2)' : 'var(--ink-2)',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { if (!disabled && !active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 2, padding: '4px 6px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
      }}>
        <ToolBtn title="無序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolBtn>
        <ToolBtn title="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolBtn>
        <div style={{ width: 1, height: 18, background: 'var(--border)', alignSelf: 'center', margin: '0 2px' }} />
        <ToolBtn title="插入連結" active={editor.isActive('link')} onClick={addLink}>
          <LinkIcon size={14} />
        </ToolBtn>
        <ToolBtn title="移除連結" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink size={14} />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div style={{ position: 'relative' }}>
        {editor.isEmpty && placeholder && (
          <div style={{
            position: 'absolute', top: 10, left: 12, pointerEvents: 'none',
            color: 'var(--muted)', fontSize: 14, lineHeight: 1.6,
          }}>{placeholder}</div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
