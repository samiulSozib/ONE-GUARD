'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Palette,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TextStyle } from '@tiptap/extension-text-style'

interface Props {
    content?: string
    onChange: (value: string) => void
    placeholder?: string
    editable?: boolean
}

export default function TiptapEditor({
    content,
    onChange,
    placeholder,
    editable = true
}: Props) {

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),

            Underline,

            Link,

            TextStyle,

            Color.configure({
                types: ['textStyle'],
            }),

            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
        ],

        content: content || '',

        editable,

        immediatelyRender: false,

        editorProps: {
            attributes: {
                class:
                    'prose dark:prose-invert max-w-none min-h-[250px] p-4 focus:outline-none',
            },
        },

        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    const setColor = (color: string) => {
        editor.chain().focus().setColor(color).run()
    }

    return (
        <div className="border rounded-md overflow-hidden dark:border-gray-700">
            {/* Toolbar */}
            <div className="border-b dark:border-gray-700 p-2 flex flex-wrap gap-2 bg-muted/40">

                {/* Bold */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('bold') ? 'default' : 'outline'}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </Button>

                {/* Italic */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('italic') ? 'default' : 'outline'}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Button>

                {/* Underline */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('underline') ? 'default' : 'outline'}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>

                {/* Bullet List */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('bulletList') ? 'default' : 'outline'}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    <List className="h-4 w-4" />
                </Button>

                {/* Ordered List */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('orderedList') ? 'default' : 'outline'}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                {/* Color Picker */}
                <div className="flex items-center gap-1 border rounded-md px-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />

                    <input
                        type="color"
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 cursor-pointer border-none bg-transparent"
                    />
                </div>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    )
}