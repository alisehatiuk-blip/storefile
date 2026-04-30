'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Code, Quote, Undo, Redo,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder = 'توضیحات محصول را اینجا بنویسید...' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-editor',
        style: 'min-height: 280px; outline: none; padding: 1rem; color: #e2e8f0; font-family: Vazirmatn, sans-serif; direction: rtl; line-height: 1.8;',
      },
    },
  });

  if (!editor) return null;

  const btn = (action: () => void, active: boolean, title: string, children: React.ReactNode) => (
    <button
      type="button"
      onClick={action}
      title={title}
      className="p-2 rounded-lg transition-all"
      style={{
        background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
        color: active ? '#a5b4fc' : '#64748b',
      }}
      onMouseEnter={(e) => { if (!active) (e.target as HTMLElement).style.color = '#e2e8f0'; }}
      onMouseLeave={(e) => { if (!active) (e.target as HTMLElement).style.color = '#64748b'; }}
    >
      {children}
    </button>
  );

  const addImage = () => {
    const url = window.prompt('آدرس تصویر را وارد کنید:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt('آدرس لینک را وارد کنید:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
        {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold', <Bold className="w-4 h-4" />)}
        {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic', <Italic className="w-4 h-4" />)}
        {btn(() => editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Code', <Code className="w-4 h-4" />)}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'H2', <Heading2 className="w-4 h-4" />)}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'H3', <Heading3 className="w-4 h-4" />)}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'لیست', <List className="w-4 h-4" />)}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'لیست شماره‌دار', <ListOrdered className="w-4 h-4" />)}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'نقل قول', <Quote className="w-4 h-4" />)}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        {btn(setLink, editor.isActive('link'), 'لینک', <LinkIcon className="w-4 h-4" />)}
        {btn(addImage, false, 'تصویر', <ImageIcon className="w-4 h-4" />)}
        <div className="w-px h-5 mx-1 mr-auto" style={{ background: 'rgba(255,255,255,0.1)' }} />
        {btn(() => editor.chain().focus().undo().run(), false, 'بازگشت', <Undo className="w-4 h-4" />)}
        {btn(() => editor.chain().focus().redo().run(), false, 'جلو', <Redo className="w-4 h-4" />)}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style>{`
        .prose-editor h2 { font-size: 1.3rem; font-weight: 700; color: white; margin: 1rem 0 0.5rem; }
        .prose-editor h3 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin: 0.8rem 0 0.4rem; }
        .prose-editor p { margin: 0.5rem 0; }
        .prose-editor ul, .prose-editor ol { padding-right: 1.5rem; margin: 0.5rem 0; }
        .prose-editor li { margin: 0.25rem 0; }
        .prose-editor code { background: rgba(99,102,241,0.1); color: #a5b4fc; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.85em; }
        .prose-editor blockquote { border-right: 3px solid #6366f1; padding-right: 1rem; color: #94a3b8; margin: 0.8rem 0; }
        .prose-editor a { color: #818cf8; text-decoration: underline; }
        .prose-editor img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
        .prose-editor .is-editor-empty::before { content: attr(data-placeholder); color: #475569; pointer-events: none; float: right; }
      `}</style>
    </div>
  );
}
