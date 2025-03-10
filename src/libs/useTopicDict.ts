import { useQuestionType } from "@/libs/useQuestionType";

const questionType = useQuestionType();
export const useTopicDict = () => {
  //choice" | "thumbtack" | "true_or_false" | "blanks";
  return [
    {
      label: "topicType.mixing",
      value: questionType.RANDOM_QUESTION,
      special: false,
      icon: new URL("@/assets/random.svg", import.meta.url).href
    },
    {
      label: "topicType.single",
      value: questionType.SINGLE_CHOICE,
      special: false,
      icon: new URL("@/assets/single.svg", import.meta.url).href
    },
    {
      label: "topicType.judgment",
      value: questionType.JUDGEMENT,
      special: false,
      icon: new URL("@/assets/demo/icon-true-or-false.svg", import.meta.url).href
    },
    {
      label: "topicType.multiple",
      value: questionType.MULTIPLE_CHOICE,
      special: false,
      icon: new URL("@/assets/multiple.svg", import.meta.url).href
    },
    {
      label: "topicType.segmentation",
      value: questionType.READING2,
      special: true,
      icon: new URL("@/assets/fd.svg", import.meta.url).href
    },
    {
      label: "topicType.whole",
      value: questionType.READING1,
      special: true,
      icon: new URL("@/assets/all.svg", import.meta.url).href
    },
    // {
    //   label: "填空题",
    //   value: 4,
    //   icon: new URL("@/assets/demo/icon-bank.svg", import.meta.url).href
    // },
    // {
    //   label: "图钉答案",
    //   value: "thumbtack",
    //   icon: new URL("@/assets/demo/icon-thumbtack.svg", import.meta.url).href
    // }
  ];
};

export const useTimeDict = () => [
  {
    label: "questionEditRightSide.second",
    value: 5
  },
  {
    label: "questionEditRightSide.second",
    value: 10
  },
  {
    label: "questionEditRightSide.second",
    value: 20
  },
  {
    label: "questionEditRightSide.second",
    value: 30
  },
  {
    label: "questionEditRightSide.second",
    value: 60
  },
  {
    label: "questionEditRightSide.second",
    value: 90
  },
  {
    label: "questionEditRightSide.second",
    value: 180
  }
];

export const useChooseType = () => {
  return [
    {
      label: "单项选择题",
      value: questionType.SINGLE_CHOICE
    },
    {
      label: "多项选择题",
      value: questionType.MULTIPLE_CHOICE
    }
  ];
};

export const useCreateAiTopic = () => {
  return [
    {
      label: "topicType.theme.topic",
      value: 1,
      icon: new URL("@/assets/topic.svg", import.meta.url).href
    },
    // {
    //   label: "PPT",
    //   value: 2,
    //   icon: new URL("@/assets/ppt.svg", import.meta.url).href
    // }
  ];
};
export const useLanguage = ()=> {
  return [
    {
      label: "中文繁體",
      value: "中文繁體",
      code: "ZH_HANT"
    },
    {
      label: "English",
      value: "English",
      code: "EN"
    },
    {
      label: "中文简体",
      value: "中文简体",
      code: "ZH_CN"
    }
  ]
}
export const useDifficultyLevel = () => {
  return Array(6)
    .fill(0)
    .map((_, i) => {
      return {
        label: i + 1 + "年级",
        value: i
      };
    });
};

export const useTopicTotal = () => {
  return [
    {
      label: "10",
      value: 10
    },
    {
      label: "20",
      value: 20
    },
    {
      label: "30",
      value: 30
    }
  ];
};
