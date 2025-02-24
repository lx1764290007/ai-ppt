import { defineComponent,ref } from "vue";
import Style from "./main.module.scss";
import { useRouter } from "vue-router";
import userIcon from "@/assets/user.webp";
import renewalIcon from "@/assets/renewal.png";
import logoIcon from "@/assets/logo@2x.png";
import { useHeaderInputStore } from "@/stores/headerInput";
import type { Grade } from "@/interface/Grade";
import { useUserInfoStore } from "@/stores/user";

export default defineComponent({
  name: "Game-Header",
  setup(props) {
    const router = useRouter();

    const {userInfo} = useUserInfoStore();
    const headerInput = useHeaderInputStore();
    const gradeList = ref<Grade.Item[]>(userInfo.grade.map(item=>{
      return {
        ...item,
        gradeName: item.gradeName + '年级'
      }
    }));
 ;
    const linkToHome = ()=>{
      router.push("/");
    }

    return () => (<div class={Style.gameHeaderMainContainer}>
      <div class={Style.left}>
        <el-image src={userIcon} class={Style.userIcon} fit="contain" />
        <div class={Style.right}>
          <span class={Style.name}>深圳中心小学</span>
          <span class={Style.expirationTime}>2024/9/4到期</span>
          <img src={renewalIcon} alt={"vip"} class={Style.renewal} />
        </div>
      </div>
      <div class={Style.center}>
        <el-image src={logoIcon} fit="contain" class={Style.centerLogo} onClick={linkToHome} />
      </div>
      <div class={Style.rightItem}>
        <el-select v-model={headerInput.gamePageGrade}   class={Style.defaultSelectTheme} placeholder="请选择" size="large">
          {
            gradeList.value.map((item)=>{
              return (
                <el-option key={item.id} value={item.id} label={item.gradeName}></el-option>
              )
            })
          }
        </el-select>
      </div>
    </div>);
  },

});
