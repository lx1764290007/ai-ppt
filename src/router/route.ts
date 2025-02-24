import { createRouter, createWebHistory } from "vue-router";
import type { Menu } from "@/interface/Menu";
import Home_AI from "@/assets/menu/PPT.png";
import Home_Setting from "@/assets/menu/ST.png";
import Opus from "@/assets/menu/AL.png";
import questionAnalysisIcon from "@/assets/menu/IQ.png";

const DICTIONARY = {
  LOGIN: "登录",
  PRIVILEGES: "没有权限",
  NOT_FOUND: "404 not found",
  SIGN_UP: "注册",
  APP_TOP_UP: "app-充值",
  FORGOT_PASSWORD: "忘记密码",
  MIDDLE_PAGE: "中间页",
  QUESTION_HOME: "问答题目",
  QUESTION_GENERATE: "题目生成",
  QUESTION_ANALYSIS: "题目分析",
  QUESTION_SETTING: "遊戲設置",
  QUESTION_EDIT: "question-generation"
};

export const routes: Menu.Data[] = [
  {
    name: DICTIONARY.MIDDLE_PAGE,
    auth: ["home"],
    path: "",
    component: () => import("@vs/Home/Home.vue"),
    permissions: [1,2,3,4,5,6,7,8,9],
    role: ["0","1"],
    menu: DICTIONARY.MIDDLE_PAGE
  },
  {
    name: "AI 功能",
    icon: Home_AI,
    auth: ["home"],
    permissions: [9],
    role: ["0"],
    menu: "menu.ai.title"
  },
  {
    name: "AI PPT",
    path: "/ai-ppt",
    auth: ["home"],
    // redirect?: string
    component: () => import("@vs/AI/PPT/PPT-View.vue"),
    children: [],
    permissions: [9],
    menu: "menu.ai.ppt",
    role: ["0"]
  },
  // {
  //   name: 'AI 评价',
  //   path: '/ai-appraise',
  //   auth: ['any'],
  //   // redirect?: string
  //   component: () => import("@vs/AI-Appraise/AI-Appraise.vue"),
  //   children: []
  // },
  {
    name: DICTIONARY.LOGIN,
    path: "/login",
    auth: ["any"],
    children: [],
    menu: "登录",
    // redirect?: string
    component: () => import("@vs/Login/Login-View-Main.vue")
  },
  {
    name: "作品管理",
    icon: Opus,
    auth: ["setting"],
    permissions: [3, 4, 5],
    role: ["0"],
    menu: "menu.work_management.title",
    // redirect?: string
  },

  {
    name: "自由创作",
    path: "/improvisation-work",
    auth: ["any"],
    children: [],
    // redirect?: string
    component: () => import("@vs/Improvisation-Work/Improvisation-Work.vue"),
    permissions: [4],
    menu: "menu.work_management.free_creation",
    role: ["0"]
  },
  {
    name: "主题作品",
    path: "/thematic-work",
    auth: ["any"],
    children: [],
    // redirect?: string
    component: () => import("@vs/Thematic-Works/Thematic-Works.vue"),
    permissions: [3],
    menu: "menu.work_management.theme_creation",
    role: ["0"]
  },
  {
    name: "学生作品",
    path: "/student-work",
    auth: ["any"],
    children: [],
    // redirect?: string
    component: () => import("@vs/Student-Work/Student-Work.vue"),
    permissions: [5],
    menu: "menu.work_management.student_works",
    role: ["0"]
  },
  {
    name: "iQuiz",
    icon: questionAnalysisIcon,
    auth: ["setting"],
    children: [],
    menu: "iQuiz",
    permissions: [10,11,12],
    role: ["0"]
    // redirect?: string
  },
  {
    name: DICTIONARY.FORGOT_PASSWORD,
    auth: ["any"],
    path: "/forget-password",
    component: () => import("@vs/Forget-Password/Forget-Password.vue"),
    role: ["0","1"],
    menu: "忘记密码"
  },
  {
    name: DICTIONARY.APP_TOP_UP,
    path: "/app-top-up",
    auth: ["any"],
    children: [],
    // redirect?: string
    component: () => import("@vs/App-Recharge/App-Recharge.vue"),
    menu: "APP充值"
  },
  {
    name: DICTIONARY.QUESTION_HOME,
    auth: ["any"],
    path: "/question-home",
    component: () => import("@vs/Question-Home/Home-Page.vue"),
    menu: "menu.menu_item_line1",
    permissions: [10,11,12],
    role: ["0"],
  },
  {
    path: "/subject-page",
    name: "subject-page",
    component: () => import("@/views/Question-Home/Subject-Page/Subject-Page.vue"),
    auth: ["any"],
    menu: "",
    permissions: [10,11,12]
  },
  {
    auth: ["any"],
    path: "/question-add",
    name: "question-add",
    component: () => import("@vs/Question-Editor/Question-Editor.vue"),
    menu: "menu.menu_item_line2",
    role: ["0"],
    permissions: [10,11]
  },
  {
    name: DICTIONARY.QUESTION_ANALYSIS,
    auth: ["any"],
    path: "/question-analysis",
    component: () => import("@vs/Analysis/V-Analysis.vue"),
    menu: "menu.analysis",
    role: ["0"],
  },
  {
    name: DICTIONARY.QUESTION_SETTING,
    auth: ["any"],
    path: "/question-setting",
    component: () => import("@vs/Question-Setting/V-Setting.vue"),
    menu: "menu.menu_item_line4",
    role: ["0"],
  },

  {
    path: "/question-generation",
    name: DICTIONARY.QUESTION_EDIT,
    component: () => import("@vs/Question-Generation/Question-Generation-Main.vue"),
    auth: ["any"],
    menu: "",

    permissions: [10,11,12]
  },
  {
    name: "系统设置",
    icon: Home_Setting,
    auth: ["setting"],
    children: [],
    menu: "menu.system_settings.title",
    role: ["0", "1"]
    // redirect?: string
  },
  {
    name: "班级管理",
    auth: ["any"],
    path: "/grade-setting",
    component: () => import("@vs/Grade-Management/Grade-Management.vue"),
    role: ["0"],
    menu: "menu.system_settings.class_management"

  },
  {
    name: "账号管理",
    auth: ["any"],
    path: "/account-management",
    component: () => import("@vs/Account-Management/Account-Management.vue"),
    role: ["1"],
    menu: "menu.system_settings.account_management"
  },
  {
    name: "付费设置",
    auth: ["any"],
    path: "/paid-setting",
    component: () => import("@vs/Paid-Settings/Paid-Setting.vue"),
    role: ["1"],
    menu: "menu.system_settings.paid_settings"
  },
  {
    name: "充值中心",
    path: '/recharge',
    auth: ['any'],
    children: [],
    // redirect?: string
    component: () => import("@vs/Subscribe/Recharge-Page.vue"),
    role: ["0"],
    menu: "menu.system_settings.recharge_center"
  },
  {
    name: "充值信息",
    auth: ["any"],
    path: "/top-up-management",
    component: () => import("@vs/Deposit-Management/Top-Up.vue"),
    role: ["1"],
    menu: "menu.system_settings.recharge_info"
  },

  {
    name: DICTIONARY.SIGN_UP,
    path: "/sign-up",
    auth: ["any"],
    children: [],
    menu: "注册",
    // redirect?: string
    component: () => import("@vs/Sign-up/Sign-Up.vue")
  },

  {
    name: "修改密码",
    path: "/change-password",
    auth: ["any"],
    children: [],
    // redirect?: string
    component: () => import("@vs/Password/Modify-Password.vue"),
    role: ["0", "1"],
    menu: "menu.system_settings.change_password"
  },

  {
    path: "/403",
    name: DICTIONARY.PRIVILEGES,
    component: () => import("@vs/403/Permission-Denied.vue"),
    auth: ["any"],
    menu: "无权限"
  },
  {
    name: DICTIONARY.NOT_FOUND,
    auth: ["any"],
    path: "/:pathMatch(.*)*",
    component: () => import("@vs/404/Not-Found.vue"),
    menu: "未找到页面"
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // @ts-ignore
  routes
});

export default router;

//排除在菜单之外的导航
export const navigationExcludedFromMenus: string[] = [
  DICTIONARY.LOGIN,
  DICTIONARY.PRIVILEGES,
  DICTIONARY.NOT_FOUND,
  DICTIONARY.SIGN_UP,
  DICTIONARY.APP_TOP_UP,
  DICTIONARY.FORGOT_PASSWORD,
  DICTIONARY.MIDDLE_PAGE
];
//不需要登录的路由(由 location.pathname 来判断)
export const RoutesDoNotRequireLogin: string[] = [
  "/login",
  "/sign-up",
  "/app-top-up",
  "/forget-password"
];
//不需要侧边栏以及顶部logo的路由
export const RoutesDoNotRequireMenu: string[] = [
  DICTIONARY.LOGIN,
  DICTIONARY.SIGN_UP,
  DICTIONARY.APP_TOP_UP,
  DICTIONARY.FORGOT_PASSWORD,
  DICTIONARY.MIDDLE_PAGE,
  DICTIONARY.QUESTION_EDIT
];
//不需要顶部logo的路由
export const RoutesDoNotRequireHeader: string[] = [
  DICTIONARY.LOGIN,
  DICTIONARY.SIGN_UP,
  DICTIONARY.APP_TOP_UP,
  DICTIONARY.FORGOT_PASSWORD,
  DICTIONARY.MIDDLE_PAGE,
]
