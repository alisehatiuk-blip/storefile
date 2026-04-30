'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useState, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus,
  AlignRight, AlignCenter, AlignLeft, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Highlighter,
  Undo, Redo, Trash2, ExternalLink,
  Type, ChevronDown,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  onImageInsert?: () => void;
}

const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#6366f1','#a855f7','#ec4899','#ffffff','#94a3b8','#475569','#1e293b'];

export default function RichEditor({ value, onChange, placeholder = 'محتوا را اینجا بنویسید...', minHeight = 400, onImageInsert }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'tiptap-link' } }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        style: `min-height: ${minHeight}px; outline: none; padding: 1.25rem 1.5rem; font-family: Vazirmatn, sans-serif; direction: rtl; line-height: 1.9; font-size: 0.9375rem; color: #e2e8f0;`,
      },
    },
  });

  const setLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}` }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const addImage = useCallback(() => {
    if (onImageInsert) {
      onImageInsert();
    } else {
      const url = prompt('آدرس تصویر را وارد کنید:');
      if (url) editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, onImageInsert]);

  if (!editor) return null;

  const ToolbarBtn = ({ onClick, active = false, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title}
      style={{
        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, background: active ? 'rgba(99,102,241,0.25)' : 'transparent',
        color: active ? '#a5b4fc' : '#94a3b8', border: 'none', cursor: 'pointer',
        transition: 'all 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );

  const Divider = () => <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px', flexShrink: 0 }} />;

  const charCount = editor.storage.characterCount?.characters() || 0;
  const wordCount = editor.storage.characterCount?.words() || 0;

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      {/* Toolbar */}
      <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="بازگشت"><Undo className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="جلو"><Redo className="w-3.5 h-3.5" /></ToolbarBtn>
        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="عنوان ۱"><Heading1 className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="عنوان ۲"><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="عنوان ۳"><Heading3 className="w-3.5 h-3.5" /></ToolbarBtn>
        <Divider />

        {/* Formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="خط زیر"><UnderlineIcon className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="خط روی متن"><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="هایلایت"><Highlighter className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="کد"><Code className="w-3.5 h-3.5" /></ToolbarBtn>
        <Divider />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="راست"><AlignRight className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="مرکز"><AlignCenter className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="چپ"><AlignLeft className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="جاستیفای"><AlignJustify className="w-3.5 h-3.5" /></ToolbarBtn>
        <Divider />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="لیست"><List className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="لیست شماره‌دار"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="نقل قول"><Quote className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="بلاک کد"><Code2 className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="خط جداکننده"><Minus className="w-3.5 h-3.5" /></ToolbarBtn>
        <Divider />

        {/* Link */}
        <div style={{ position: 'relative' }}>
          <ToolbarBtn onClick={() => { setShowLinkInput(!showLinkInput); setLinkUrl(editor.getAttributes('link').href || ''); }} active={editor.isActive('link')} title="لینک">
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarBtn>
          {showLinkInput && (
            <div style={{ position: 'absolute', top: 34, right: 0, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px', zIndex: 100, width: 260, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && setLink()} placeholder="https://example.com" dir="ltr"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: 'white', fontSize: '0.8125rem', fontFamily: 'monospace', outline: 'none', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={setLink} style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', borderRadius: 7, padding: '5px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}>تایید</button>
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '5px 10px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}>حذف</button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <ToolbarBtn onClick={addImage} title="درج تصویر"><ImageIcon className="w-3.5 h-3.5" /></ToolbarBtn>
        <Divider />

        {/* Color picker */}
        <div style={{ position: 'relative' }}>
          <ToolbarBtn onClick={() => setShowColorPicker(!showColorPicker)} title="رنگ متن">
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Type className="w-3.5 h-3.5" />
              <div style={{ width: 10, height: 3, borderRadius: 2, background: editor.getAttributes('textStyle').color || '#ffffff' }} />
            </div>
          </ToolbarBtn>
          {showColorPicker && (
            <div style={{ position: 'absolute', top: 34, right: 0, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, width: 152 }}>
                {COLORS.map(c => (
                  <button key={c} type="button" title={c}
                    onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                    style={{ width: 22, height: 22, borderRadius: 5, background: c, border: editor.getAttributes('textStyle').color === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />


      {/* Footer: char count */}
      <div style={{ padding: '6px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', background: 'rgba(0,0,0,0.15)' }}>
        <span>{wordCount} کلمه</span>
        <span>{charCount} کاراکتر</span>
      </div>

      <style>{`
        .tiptap-content h1 { font-size: 1.6rem; font-weight: 800; color: white; margin: 1.2rem 0 0.6rem; }
        .tiptap-content h2 { font-size: 1.3rem; font-weight: 700; color: white; margin: 1rem 0 0.5rem; }
        .tiptap-content h3 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin: 0.8rem 0 0.4rem; }
        .tiptap-content p { margin: 0.5rem 0; }
        .tiptap-content ul, .tiptap-content ol { padding-right: 1.5rem; margin: 0.5rem 0; }
        .tiptap-content li { margin: 0.25rem 0; }
        .tiptap-content blockquote { border-right: 3px solid #6366f1; padding-right: 1rem; color: #94a3b8; margin: 0.8rem 0; font-style: italic; }
        .tiptap-content code { background: rgba(99,102,241,0.12); color: #a5b4fc; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.875em; }
        .tiptap-content pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1rem 1.25rem; margin: 0.75rem 0; overflow-x: auto; }
        .tiptap-content pre code { background: none; color: #a5b4fc; padding: 0; }
        .tiptap-content a, .tiptap-link { color: #818cf8; text-decoration: underline; cursor: pointer; }
        .tiptap-content img { max-width: 100%; border-radius: 10px; margin: 0.75rem 0; }
        .tiptap-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0; }
        .tiptap-content mark { background: rgba(234,179,8,0.3); color: inherit; border-radius: 3px; padding: 0 2px; }
        .tiptap-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #475569; float: right; pointer-events: none; height: 0; }
      `}</style>
    </div>
  );
}
