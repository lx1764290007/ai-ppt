
export interface TopicOverview {
  id: number ;
  subjectName: string;
  subjectEn: string;
  subjectHk: string;
  subjectCn: string;
  subjectImg: string;
  topic: number
  question_types: number
  answersNum:number
  gradeId: number
  questionSize:number
  subjectTypeSize: number
  subjectNameEn?: string
  subjectNameCn?: string
  subjectNameHk?: string
}

export interface TopicType {
  id: number
  typeName: string
  typeImg: string
  userId: number
  subjectId: number
  gradeId: number
  docId?:string
}