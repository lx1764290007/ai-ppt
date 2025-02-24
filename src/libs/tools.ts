import type { QuestionAnswer, QuestionItem } from "@/interface/Topic";
import { useQuestionType } from "@/libs/useQuestionType";
/**
 * export interface QuestionItem {
 *   answer: string[]
 *   images: {image: string}[]
 *   image_keywords: string[]
 *   options: string[]
 *   question: string
 *   type: QuestionType
 * }
 */

/**
 * export interface QuestionAnswer {
 *   id: number;
 *   type: number;
 *   question: string;
 *   questionImg: string;
 *   maxTime: number;
 *   time: number;
 *   answers: any[];
 *   correctAnswer: string;
 *   userId: number;
 *   gradeId: number;
 *   subjectId: number;
 *   subjectTypeId: number;
 *   remark: string;
 *   reserve: string;
 * }
 */
export const covertQuestionAnswer2QuestionItem = (questionAnswer: QuestionAnswer): QuestionItem => {
  return {
    ...questionAnswer,
    answer: typeof questionAnswer.correctAnswer === "string" ? (questionAnswer.correctAnswer || "").split(",") : questionAnswer.correctAnswer,
    images: [{ image: questionAnswer.questionImg }],
    image_keywords: typeof questionAnswer.answers === "string" ? (questionAnswer.answers as string).split(",") : questionAnswer.answers,
    options: typeof questionAnswer.answers === "string" ? (questionAnswer.answers as string).split(",") : questionAnswer.answers,
    question: questionAnswer.question,
    type: questionAnswer.type
  };
};
export const covertQuestionItem2QuestionAnswer = (questionItem: QuestionItem): QuestionAnswer => {

  return {
    ...questionItem,
    id: questionItem.id || 0,
    type: questionItem.type,
    question: questionItem.question,
    questionImg: questionItem.images?.[0]?.image || "",
    maxTime: questionItem.maxTime || 10,
    time: questionItem.time || 10,
    answers: typeof questionItem.options !== "string" ? JSON.stringify(questionItem.options) : questionItem.options,
    correctAnswer: typeof questionItem.answer !== "string" ? JSON.stringify(questionItem.answer) : questionItem.answer,
    userId: questionItem.userId || 0,
    gradeId: questionItem.gradeId || 0,
    subjectId: questionItem.subjectId || 0,
    subjectTypeId: questionItem.subjectTypeId || 0,
    remark: questionItem.remark || "",
    reserve: questionItem.reserve || ""
  };
};
export const covertQuestionAnswer2Array = (questionAnswer: QuestionAnswer): QuestionAnswer => {
  return Object.assign({}, questionAnswer, {
    answers: typeof questionAnswer.answers === "string" ? (questionAnswer.answers as string).split(",") : questionAnswer.answers,
    correctAnswer: typeof questionAnswer.correctAnswer === "string" ? (questionAnswer.correctAnswer as string).split(",") : questionAnswer.correctAnswer
  });
};
//判断一个对象是否能被保存
export const objectCanSave = (target: any) => {
 //1 判断所有关键字段是否都有值 2根据题目类型判断选项是否合法
  const keys = ["id","type", "subjectTypeId", "subjectId", "userId", "gradeId", "correctAnswer", "answers", "maxTime", "questionImg", "question"];
  if (target instanceof Object) {
    const firstStepResult =  keys.every((key: any) => {
      return target[key] !== undefined && target[key] !== null && target[key] !== "";
    });
    if(!firstStepResult) return false;
    const _target = target as QuestionAnswer;
    const questionType = useQuestionType();
    if(_target.type === questionType.SINGLE_CHOICE || _target.type === questionType.MULTIPLE_CHOICE || _target.type === questionType.JUDGEMENT) {
      const correctAnswer = typeof _target.correctAnswer === "string"? JSON.parse(_target.correctAnswer) as string[] : _target.correctAnswer;
      const answers = typeof _target.answers === "string"? JSON.parse(_target.answers) as string[]:_target.answers;

      //需要有至少一个选项
      if( answers.filter(it=> Boolean(it)).length < 1){
          return false
      }
      //需要有至少一个答案
      if(correctAnswer.filter(it=> Boolean(it)).length < 1){
        return false;
      }
      if(!answers.some(it=> correctAnswer.includes(it))){
        return false;
      }
      if((_target.type === questionType.SINGLE_CHOICE || _target.type === questionType.JUDGEMENT) && correctAnswer.filter(it=> Boolean(it)).length > 1){
        throw "questionEdit.singleChoiceErrorText"
      }
    }
    return true
  }
  return false;
};
export const objectCanCreate = (target: any) => {
  const keys = ["type", "subjectTypeId", "subjectId", "userId", "gradeId", "correctAnswer", "answers", "maxTime", "questionImg", "question"];
  if (target instanceof Object) {
    const firstStepResult =  keys.every((key: any) => {
      return target[key] !== undefined && target[key] !== null && target[key] !== "" && target[key];
    });
    if(!firstStepResult) return false;
    const _target = target as QuestionAnswer;
    const questionType = useQuestionType();
    if(_target.type === questionType.SINGLE_CHOICE || _target.type === questionType.MULTIPLE_CHOICE || _target.type === questionType.JUDGEMENT) {
      const correctAnswer = typeof _target.correctAnswer === "string"? JSON.parse(_target.correctAnswer) as string[] : _target.correctAnswer;
      const answers = typeof _target.answers === "string"? JSON.parse(_target.answers) as string[]:_target.answers;
      //需要有至少一个选项
      if( answers.filter(it=> Boolean(it)).length < 1){
        return false
      }
      //需要有至少一个答案
      if(correctAnswer.filter(it=> Boolean(it)).length < 1){
        return false;
      }
      if((_target.type === questionType.SINGLE_CHOICE || _target.type === questionType.JUDGEMENT) && correctAnswer.filter(it=> Boolean(it)).length > 1){
        throw "questionEdit.singleChoiceErrorText"
      }
      if(!_target.answers.some(it=> correctAnswer.includes(it))){
        return false;
      }
    }
    return true
  }
  return false;
};

export const removeRedundantAnswers = (target:QuestionItem):QuestionItem=>{
  const answers = target.answer, options = target.options;
  const newAnswers = answers.filter(it=> options.includes(it));
  return Object.assign({},target, {answer: newAnswers});
}