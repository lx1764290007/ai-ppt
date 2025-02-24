import { defineComponent, ref, watch } from "vue";
import { ElButton, ElDialog, ElIcon, ElImage, ElOption, ElScrollbar, ElSelect } from "element-plus";
import "./game.scss";
import { useRandomLinearBackgroundStyle } from "@/libs/useRandomLinearBackgroundStyle";
import "@/theme.scss";
import { Close } from "@element-plus/icons-vue";

export default defineComponent({
  name: "Select-Game",
  props: {
    data: {
      type: String,
      value: ""
    },
    visible: {
      type: Boolean,
      value: false
    }
  },
  emits: ["update:visible"],
  setup(props,slots) {
    const visible = ref(props.visible);
    const randomColors = useRandomLinearBackgroundStyle();
    const onClose =()=> {
      slots.emit("update:visible", false);
    }
    const randomBackgrounds = Array(10).fill(1).map(()=> randomColors())
    const gameType = ref(1);
    watch(props,(newVal)=>{
      visible.value = newVal.visible;
    })
    // 返回给模板使用的内容
    return () => (
      <ElDialog v-model={visible.value}
                width={"70%"}
                title={undefined}
                onClose={onClose}
                showClose={false}>
        <div class={"wrapper_1game"}>
          <header class={"header"}>
            <ElSelect v-model={gameType.value} class={"input__default_theme"} style={{ width: '140px' }} size={"large"}>
              <ElOption label={"游戏1"} value={1}></ElOption>
              <ElOption label={"游戏2"} value={2}></ElOption>
            </ElSelect>
            <div class={"title"}>选择游戏</div>
            <ElIcon class={"close"} onClick={()=>onClose()}>
              <Close />
            </ElIcon>
          </header>
          <main class={"main"}>
            <ElScrollbar class={"container"} always>
              <div class={"content"}>
                {
                  randomBackgrounds.map((item) => {
                    return <div class={"item"}>
                      <ElImage src={"https://cdn.pixabay.com/photo/2022/09/07/12/22/autumn-7438675_640.jpg"}
                               fit={"cover"} />
                      <div class={"footer"} style={item}>
                        <div class={"footer-title"}>{item.background}</div>
                        <div class={"footer-desc"}>共12题</div>
                      </div>
                    </div>;
                  })
                }
              </div>
            </ElScrollbar>

          </main>
          <footer style={{textAlign: 'center',marginTop:'20px'}}>
            <ElButton size={"large"} style={{margin: '0 auto',backgroundColor: '#642ba6',color: "#fff"}}  >
              开始答题
            </ElButton>
          </footer>

        </div>

      </ElDialog>
    );
  }
});
