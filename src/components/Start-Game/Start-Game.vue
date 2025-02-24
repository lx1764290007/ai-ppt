<template>
  <div class="container" v-loading="loading"
       :style="{height: action===0 || gameList.length < 1? locale==='EN'? '220px':'200px':locale==='EN'? '420px':'410px',width:locale==='EN'? '540px':'500px'}">
    <el-icon class="game-close" @click="onClose">
      <Close />
    </el-icon>
    <div class="item" v-show="gameList.length>0">
      <span class="item-tips" v-if="gameList.length>0">{{ $t("startGame.tip") }}</span>
    </div>
    <div :class="{item:true,'item-game':action===0}" v-show="gameList.length>0">
      <el-select v-model="game" class="input__default_theme" size="large" :placeholder="$t('startGame.input')">
        <el-option :label="item.gameName" :value="item.id" v-for="item in gameList" :key="item.id">
          <div class="item-option">
            <el-image :src="item.gameImage" fit="contain" class="image-icon" />
            <span class="game-label">{{ item.gameName }}</span>
          </div>
        </el-option>

      </el-select>
    </div>
    <div class="item" v-show="gameList.length>0 && action === 1">
      <div class="qrcode">
        <el-image :src="qrcodeImage" fit="contain" v-if="qrcodeImage" />
      </div>
    </div>
    <div class="item" v-show="gameList.length>0 && action === 1">

      <el-input placeholder="link" size="large" class="input__default_theme input" readonly :value="getIframeSrc">
        <template #append>
          <el-button size="large" icon="document" @click="onCopy">
            {{ $t("startGame.copy") }}
          </el-button>
        </template>
      </el-input>
    </div>


    <div class="empty-data" v-if="!loading && gameList.length===0">
      <el-icon style="font-size: larger;margin-right: 5px">
        <InfoFilled />
      </el-icon>
      <span>{{ $t("startGame.noGame") }}</span>
    </div>
    <div class="item" v-if="!loading && gameList.length===0 || action === 1">
      <el-button class="buttons-default" size="large" style="width: 150px" @click="onClose">
        {{ $t("startGame.close") }}
      </el-button>
    </div>
    <div class="item" v-show="gameList.length>0 && action === 0">
      <div class="footer" style="margin-top: 10px">
        <el-button class="buttons-primary" size="large" @click="onShowGame">
          {{ $t("startGame.confirm") }}
        </el-button>
      </div>
    </div>
  </div>
  <audio :src="aac"
         ref="audioRef"
         style="opacity: 0;position: absolute;left:0;top:0;width:10px;height: 10px;z-index: -1"
         :controls="false"></audio>
  <teleport to="body">
    <div class="container-iframe" v-if="showGame">
      <loading-component :show="showLoading" />
      <iframe :src="getIframeSrc" allowfullscreen class="iframe-iframe" ref="iframeRef">
        不支持iframe
      </iframe>
    </div>
  </teleport>
</template>
<script setup lang="ts">
import { fetchGameList } from "@/http/game";
import type { Http } from "@/interface/Http";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from "vue";
import { ElMessage } from "element-plus";
import aac from "@/assets/silent_audio.aac";
//@ts-ignore
import qrCode from "qrcode";
import { Close, InfoFilled } from "@element-plus/icons-vue";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { useI18n } from "vue-i18n";


interface Game {
  gameName: string;
  gameImage: string;
  remark: string;
  id: number;
}

const audioRef = ref<HTMLAudioElement>();
const showGame = ref(false);
const props = defineProps<{
  subjectTypeId?: number
  action: 0 | 1  //0是游戏 1是分享
}>();
const emit = defineEmits<{
  (ev: "close"): void
}>();
const game = ref<number>();
const gameList = ref<Game[]>([]);
const loading = ref(false);
const iframeRef = ref<HTMLIFrameElement>();
const showLoading = ref(false);
const getGameList = () => {
  loading.value = true;
  fetchGameList({
    subjectTypeId: props.subjectTypeId
  }).then((res: Http.Response<Game[]>) => {
    if (res.code === 200) {
      gameList.value = res.data;
      if (gameList.value[0]) {
        game.value = gameList.value[0].id;
      }
    }
  }).finally(() => {
    loading.value = false;
  });
};

const qrcodeImage = ref<string>();
const { locale,t } = useI18n();
const getIframeSrc = computed(() => {
  const target = gameList.value.find(it => it.id === game.value)?.remark || "";
  return target ? `${target}?subjectId=${props.subjectTypeId}&origin=${encodeURIComponent(window.location.origin)}` : "";
});
const onCopy = async () => {
  const text = getIframeSrc.value;
  try {
    await navigator.clipboard.writeText(text);
    ElMessage({
      message: t("startGame.copied"),
      icon: "Finished", // 自定义图标
      type: "success",
      duration: 3000,
      offset: 50
    });
  } catch (err) {
    console.log(t("startGame.copyError"), err);
    // 如果 Clipboard API 不可用，则回退到 execCommand 方法（可选）
    if (!navigator.clipboard) {
      console.log("Clipboard API 不可用，尝试 execCommand 回退");
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // 避免页面布局变化
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        const msg = successful ? t("startGame.copied") : t("startGame.copyError");

        ElMessage({
          message: msg,
          icon: "Finished", // 自定义图标
          type: "success",
          duration: 3000,
          offset: 50
        });
      } catch (err) {
        console.log("execCommand 复制失败", err);
      }
      document.body.removeChild(textArea);
      return;
    }
  }
};
const onShowGame = () => {
  if (gameList.value.find(it => it.id === game.value)?.remark) {
    showGame.value = true;
    nextTick(() => {
      setFullscreen();
    });

    audioRef.value?.play?.();
  } else {
    ElMessage({
      message: t("gameStart.gamePathError"),
      icon: "WarnTriangleFilled", // 自定义图标
      type: "error",
      duration: 3000,
      offset: 50
    });
  }
};
const createQrCode = () => {
  const text = gameList.value.find(it => it.id === game.value)?.remark || "";
  if (!text) {
    qrcodeImage.value = "";
    return;
  }
  // 使用 canvas 生成二维码
  qrCode.toDataURL(text, (err: any, url: string) => {
    if (err) {
      console.error(err);
    } else {
      qrcodeImage.value = url;
    }
  });
};
const onClose = () => {
  emit("close");
};
const setFullscreen = async () => {
  showLoading.value = true;
  if (iframeRef.value) {
    await iframeRef.value.requestFullscreen();
    const message = { type: "fullscreen" };
    iframeRef.value.contentWindow?.postMessage(message, gameList.value.find(it => it.id === game.value)?.remark || "*"); // 替换 '*' 为 iframe 的具体源（origin）以提高安全性
  }
};
watchEffect(() => {
  if (game.value) {
    createQrCode();
  }
});
const postMessage = () => {
  const message = { type: "screen-change" };
  iframeRef.value?.contentWindow?.postMessage(message, gameList.value.find(it => it.id === game.value)?.remark || "*");
};
const onMessage = (data: any) => {

  showLoading.value = false;
};
onMounted(() => {
  if (props.subjectTypeId) {
    getGameList();
  }
  document.addEventListener("fullscreenchange", postMessage);
  window.addEventListener("message", onMessage);
});

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", postMessage);
  document.removeEventListener("message", onMessage);
});
</script>
<style scoped lang="scss">
@import "@/theme";

.container {
  width: 500px;
  height: 410px;
  background-color: #fff;
  position: relative;
  padding: 15px;
  box-sizing: border-box;
  border-radius: 8px;
  transition: height .3s;

  .game-close {
    position: absolute;
    right: 10px;
    top: 10px;
    color: #333;
    font-size: 22px;
    cursor: pointer;
  }

  .item {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    & + .item {
      margin-top: 20px;
    }
  }

  .item-game {
    //margin-top: 100px !important;
  }

  .qrcode {
    width: 140px;
    height: 140px;
    background-color: #ccc;
    border-radius: 5px;
  }

  .input {
    width: 80%;
  }

  .item-tips {
    font-weight: bold;
    font-size: 16px;
    color: #43536C;
    white-space: pre;
  }
}

.empty-data {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5e5e5e;
}

.item-option {
  display: flex;
  width: 100%;
  height: 60px;
  align-items: center;

  .image-icon {
    width: 30px;
  }

  .game-label {
    transform: translateY(-10px);
    margin-left: 5px;
  }
}

.container-iframe {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, .3);
  display: flex;
  align-items: center;
  justify-content: center;

  .iframe-iframe {
    width: 100vw;
    height: 100vh;
    outline: 0;
    border: 0;
  }
}
</style>