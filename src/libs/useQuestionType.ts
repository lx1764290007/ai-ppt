//export type QuestionType = 1 | 2 | 3 | 4 | 5 | number //1选择题 2判断题 3多项选择 4填空题 5图钉答案
export const useQuestionType = ()=> {
  return {
    RANDOM_QUESTION: 0,
    SINGLE_CHOICE: 1,
    JUDGEMENT: 2,
    MULTIPLE_CHOICE: 3,
    READING1: 4,  //整段閱讀
    READING2: 5,  //分段閱讀
    BLANKS: 6,
    THUMBTACK: 7
  }
}