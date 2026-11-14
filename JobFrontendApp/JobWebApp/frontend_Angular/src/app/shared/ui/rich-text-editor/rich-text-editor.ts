import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  forwardRef,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import { IconName } from '../icon/icons';
import { Icon } from '../icon/icon';

interface ToolbarControl {
  icon: IconName;
  label: string;
  run: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
}

/**
 * Tiptap rich-text editor as a form control (same editor engine the React app
 * uses through @mantine/tiptap). The form value is the editor's HTML.
 */
@Component({
  selector: 'app-rich-text-editor',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichTextEditor), multi: true }],
  template: `
    <div class="overflow-hidden rounded-md border border-mine-shaft-800 bg-mine-shaft-950">
      <div class="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-mine-shaft-800 bg-mine-shaft-950 p-2" role="toolbar">
        @for (group of groups; track $index) {
          <div class="flex overflow-hidden rounded border border-mine-shaft-800">
            @for (control of group; track control.label) {
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center border-r border-mine-shaft-800 text-mine-shaft-200 last:border-r-0 hover:bg-mine-shaft-900"
                [class]="isActive(control) ? 'bg-bright-sun-400/20 text-bright-sun-400' : ''"
                [title]="control.label"
                [attr.aria-label]="control.label"
                [attr.aria-pressed]="isActive(control)"
                (click)="exec(control)"
              >
                <app-icon [name]="control.icon" [size]="16" />
              </button>
            }
          </div>
        }
      </div>
      <div #host class="rich-text min-h-48 px-4 py-2 [&_.ProseMirror]:min-h-44 [&_.ProseMirror]:outline-none"></div>
    </div>
  `,
})
export class RichTextEditor implements ControlValueAccessor, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private editor: Editor | null = null;
  private pendingValue = '';
  /** Bumped on every editor transaction so toolbar active states re-render. */
  private readonly revision = signal(0);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly groups: ToolbarControl[][] = [
    [
      { icon: 'bold', label: 'Bold', run: (e) => e.chain().focus().toggleBold().run(), isActive: (e) => e.isActive('bold') },
      { icon: 'italic', label: 'Italic', run: (e) => e.chain().focus().toggleItalic().run(), isActive: (e) => e.isActive('italic') },
      { icon: 'underline', label: 'Underline', run: (e) => e.chain().focus().toggleUnderline().run(), isActive: (e) => e.isActive('underline') },
      { icon: 'strikethrough', label: 'Strikethrough', run: (e) => e.chain().focus().toggleStrike().run(), isActive: (e) => e.isActive('strike') },
      { icon: 'clear-formatting', label: 'Clear formatting', run: (e) => e.chain().focus().unsetAllMarks().clearNodes().run() },
      { icon: 'highlight', label: 'Highlight', run: (e) => e.chain().focus().toggleHighlight().run(), isActive: (e) => e.isActive('highlight') },
      { icon: 'code', label: 'Code', run: (e) => e.chain().focus().toggleCode().run(), isActive: (e) => e.isActive('code') },
    ],
    ([1, 2, 3, 4] as const).map((level) => ({
      icon: `h-${level}` as IconName,
      label: `Heading ${level}`,
      run: (e: Editor) => e.chain().focus().toggleHeading({ level }).run(),
      isActive: (e: Editor) => e.isActive('heading', { level }),
    })),
    [
      { icon: 'blockquote', label: 'Blockquote', run: (e) => e.chain().focus().toggleBlockquote().run(), isActive: (e) => e.isActive('blockquote') },
      { icon: 'separator-horizontal', label: 'Horizontal line', run: (e) => e.chain().focus().setHorizontalRule().run() },
      { icon: 'list', label: 'Bullet list', run: (e) => e.chain().focus().toggleBulletList().run(), isActive: (e) => e.isActive('bulletList') },
      { icon: 'list-numbers', label: 'Ordered list', run: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive('orderedList') },
      { icon: 'subscript', label: 'Subscript', run: (e) => e.chain().focus().toggleSubscript().run(), isActive: (e) => e.isActive('subscript') },
      { icon: 'superscript', label: 'Superscript', run: (e) => e.chain().focus().toggleSuperscript().run(), isActive: (e) => e.isActive('superscript') },
    ],
    [
      { icon: 'link', label: 'Link', run: (e) => this.setLink(e), isActive: (e) => e.isActive('link') },
      { icon: 'unlink', label: 'Remove link', run: (e) => e.chain().focus().unsetLink().run() },
    ],
    (['left', 'center', 'justify', 'right'] as const).map((align) => ({
      icon: (align === 'justify' ? 'align-justified' : `align-${align}`) as IconName,
      label: `Align ${align}`,
      run: (e: Editor) => e.chain().focus().setTextAlign(align).run(),
      isActive: (e: Editor) => e.isActive({ textAlign: align }),
    })),
    [
      { icon: 'arrow-back-up', label: 'Undo', run: (e) => e.chain().focus().undo().run() },
      { icon: 'arrow-forward-up', label: 'Redo', run: (e) => e.chain().focus().redo().run() },
    ],
  ];

  constructor() {
    // Tiptap needs a real DOM node, so create it after the first render.
    afterNextRender(() => {
      this.editor = new Editor({
        element: this.host().nativeElement,
        extensions: [
          StarterKit.configure({ link: { openOnClick: false } }),
          Highlight,
          Subscript,
          Superscript,
          TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: this.pendingValue,
        onUpdate: ({ editor }) => this.onChange(editor.getHTML()),
        onTransaction: () => this.revision.update((n) => n + 1),
        onBlur: () => this.onTouched(),
      });
    });
  }

  writeValue(value: string | null): void {
    this.pendingValue = value ?? '';
    if (this.editor && this.editor.getHTML() !== this.pendingValue) {
      this.editor.commands.setContent(this.pendingValue, { emitUpdate: false });
    }
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected isActive(control: ToolbarControl): boolean {
    this.revision();
    return !!this.editor && !!control.isActive?.(this.editor);
  }

  protected exec(control: ToolbarControl): void {
    if (this.editor) control.run(this.editor);
  }

  private setLink(editor: Editor): void {
    const previous = editor.getAttributes('link')['href'] as string | undefined;
    const url = window.prompt('Enter URL', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
