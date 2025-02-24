
export declare namespace Classes {
  interface Data {
    classes: string
    className: string
    grade: string
    gradeId: number
    userId: number
    id?: number
  }
  interface Grade {
    grade?: number
    id: number
    label: string
    editable: boolean
    editing: boolean
    gradeName: string
  }
}