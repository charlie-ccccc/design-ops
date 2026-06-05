'use client';
import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  Bold, Italic, List, ListOrdered,
  Link as LinkIcon, Unlink,
  ImagePlus, Table2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  maxHeight?: number;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, minHeight = 200, maxHeight, placeholder }: RichTextEditorProps) {
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
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
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

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('輸入圖片 URL');
    if (!url) return;
    const src = url.startsWith('http') ? url : `https://${url}`;
    editor.chain().focus().setImage({ src }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const inTable = editor.isActive('table');

  const ToolBtn = ({ active, disabled, onClick, title, children, small }: {
    active?: boolean; disabled?: boolean; onClick: () => void; title: string;
    children: React.ReactNode; small?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: small ? 'auto' : 28, height: 28,
        padding: small ? '0 6px' : '0',
        borderRadius: 5, border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : disabled ? 'var(--muted-2)' : 'var(--ink-2)',
        fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { if (!disabled && !active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );

  const Sep = () => (
    <div style={{ width: 1, height: 18, background: 'var(--border)', alignSelf: 'center', margin: '0 2px' }} />
  );

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface)' }}>
      <div style={{
        display: 'flex', gap: 2, padding: '4px 6px', flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
      }}>
        {/* Text formatting */}
        <ToolBtn title="粗體" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn title="斜體" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolBtn>
        <Sep />

        {/* Lists */}
        <ToolBtn title="無序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolBtn>
        <ToolBtn title="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolBtn>
        <Sep />

        {/* Link */}
        <ToolBtn title="插入連結" active={editor.isActive('link')} onClick={addLink}>
          <LinkIcon size={14} />
        </ToolBtn>
        <ToolBtn title="移除連結" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink size={14} />
        </ToolBtn>
        <Sep />

        {/* Image */}
        <ToolBtn title="插入圖片 URL" onClick={addImage}>
          <ImagePlus size={14} />
        </ToolBtn>
        <Sep />

        {/* Table */}
        <ToolBtn title="插入表格 (3×3)" onClick={insertTable}>
          <Table2 size={14} />
        </ToolBtn>

        {/* Contextual table operations */}
        {inTable && (
          <>
            <Sep />
            <ToolBtn small title="在左側插入欄" onClick={() => editor.chain().focus().addColumnBefore().run()}>+欄←</ToolBtn>
            <ToolBtn small title="在右側插入欄" onClick={() => editor.chain().focus().addColumnAfter().run()}>+欄→</ToolBtn>
            <ToolBtn small title="刪除目前欄" onClick={() => editor.chain().focus().deleteColumn().run()}>-欄</ToolBtn>
            <Sep />
            <ToolBtn small title="在上方插入列" onClick={() => editor.chain().focus().addRowBefore().run()}>+列↑</ToolBtn>
            <ToolBtn small title="在下方插入列" onClick={() => editor.chain().focus().addRowAfter().run()}>+列↓</ToolBtn>
            <ToolBtn small title="刪除目前列" onClick={() => editor.chain().focus().deleteRow().run()}>-列</ToolBtn>
            <Sep />
            <ToolBtn small title="刪除整個表格" onClick={() => editor.chain().focus().deleteTable().run()}>刪表</ToolBtn>
          </>
        )}
      </div>

      <div style={{ position: 'relative', overflowY: maxHeight ? 'auto' : undefined, maxHeight: maxHeight }}>
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
