
type TopicType = "choice" | "thumbtack" | "true_or_false" | "blanks";  //表示选择题类型 选择题|图钉答案|判断题|填空题
type TopicOptions = { label: string; id: number }; //题目选项 @label=选项名称 @id=选项唯一标识
type TopicAnswer = number[]; //答案列表 ids

export interface Topic {
  type: TopicType;                   //题目类型
  question: string;                  //问题
  image?: string;                    //图片
  subType?: "single" | "multiple";   //选择题里的单选或者多选
  options?: TopicOptions[];          //选项列表
  answers?: TopicAnswer;             //答案列表 选项的id
  dataJSON?: any;                    //圈选工具结果object
  time: number;                      //答题时间
}

export interface QuestionAnswer {
  id: number;
  type: number;
  question: string;
  questionImg: string;
  maxTime: number;
  time: number;
  answers: string;
  correctAnswer: string;
  userId: number;
  gradeId: number;
  subjectId: number;
  subjectTypeId: number;
  remark: string;
  reserve: string;
  displayLink?: string
  copyRight?: string
  imageKeywords?: string
  article?: string
  layout?: number
  subLayout?: number
  questionGroup?: string

}

export type QuestionType = 1 | 2 | 3 | 4 | 5 | number //1选择题 2判断题 3多项选择 4填空题 5图钉答案

export interface QuestionGeneral {
  text: string;
  questionType: QuestionType;
  grade: number;
  subject: number;
  count: string;
  language: string;
  area: string
}

export interface QuestionItem extends Partial<QuestionAnswer> {
  answer: string[];
  images: { image: string,title?: string }[];
  image_keywords: string[];
  options: string[];
  question: string;
  type: QuestionType;

}

export interface Question {
  introduction: string;
  openEnded: string;
  trivia: string;
  questions: QuestionItem[];
}
