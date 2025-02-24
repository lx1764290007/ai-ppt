export interface PText {
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  fontSize: string
  data: string
}
export interface PImage {
  element: HTMLImageElement
  key: number | string
  option: {
    path: string
    x: number | string
    y: number | string
    w: number | string,
    h: number | string
    sizing: {
      type: 'contain'|'cover'
      w: number | string
      h: number | string
    }
  }
}
export interface PItem {
  content: PText
  image?: PImage
  theme?: string
}
type Template = number;
type PptType = 'title'|'content'|'summarize'|'discuss'|'catalog';
export interface TemplatePreview {
  template: Template
  type: PptType
  title?: string
}

export interface TemplateData {
  type: PptType
  title?: string
  [key: string]: string
}