'use client';

import { useRef, useState } from 'react';

type Command = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock' | 'undo' | 'redo';
const tools: Array<{ label: string; command: Command; value?: string; title: string }> = [
    { label: 'B', command: 'bold', title: 'In đậm' }, { label: 'I', command: 'italic', title: 'In nghiêng' },
    { label: 'U', command: 'underline', title: 'Gạch chân' }, { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Tiêu đề' },
    { label: '• Danh sách', command: 'insertUnorderedList', title: 'Danh sách dấu chấm' },
    { label: '1. Danh sách', command: 'insertOrderedList', title: 'Danh sách đánh số' },
    { label: '❝', command: 'formatBlock', value: 'blockquote', title: 'Trích dẫn' },
    { label: '↶', command: 'undo', title: 'Hoàn tác' }, { label: '↷', command: 'redo', title: 'Làm lại' },
];

export default function RichTextEditor() {
    const editorRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState('');
    function run(command: Command, commandValue?: string) {
        editorRef.current?.focus(); document.execCommand(command, false, commandValue);
        setValue(editorRef.current?.innerHTML ?? '');
    }
    return <div className="overflow-hidden rounded-lg border border-zinc-300 focus-within:border-zinc-500">
        <div className="flex flex-wrap gap-1 border-b border-zinc-300 bg-zinc-50 p-2 dark:bg-zinc-900">{tools.map(item=><button key={`${item.command}-${item.value??''}`} type="button" title={item.title} aria-label={item.title} onMouseDown={event=>event.preventDefault()} onClick={()=>run(item.command,item.value)} className="min-h-8 rounded-md px-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">{item.label}</button>)}</div>
        <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder="Mô tả vị trí, hiện trạng, nội thất, tiện ích xung quanh..." onInput={event=>setValue(event.currentTarget.innerHTML)} className="rich-text-editor min-h-56 bg-transparent p-3 outline-none"/>
        <input type="hidden" name="description" value={value}/>
    </div>;
}
