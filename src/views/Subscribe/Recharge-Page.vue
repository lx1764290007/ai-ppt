<template>
  <div class="subscription-center--title" :style="{'background-color': route.query.userId? 'transparent':'#fff'}">
    {{ $t("recharge.recharge_center") }}
  </div>
  <div :class="{'subscription-center--scroll':true,'subscription-center--scroll-com':route.query.userId}" v-loading="launchLoading">
    <div :class="{'subscription-center':true, 'subscription-center-component':isComponent}">
      <!-- 左侧部分：管理员信息和剩余时间 -->
      <div :class="{sidebar:true}">
        <div class="user-info">
          <el-image alt="icon" :src="userInfo.getUserInfo.user?.remark"
                    fit="contain"
                    class="avatar"
                    :style="{backgroundColor: userInfo.getUserInfo.user?.remark?.endsWith('default.png')? 'transparent':'rgba(0, 0, 0, 0.3)'}" />

          <div class="user-title">
            {{ userInfo.getUserInfo.user?.nickname }}
          </div>

          <div class="subscription-status" v-if="userInfo.getUserInfo.user?.userType === USER_TYPE.VISITOR">
            <div class="subscription-center--line">
              <!--              <img src="@/assets/vip-recharge.png" alt="vip" />-->
              <!--              <p v-if="!timeVipExpire" style="font-weight: bold">$<span style="font-size: 30px">10</span></p>-->
              <p :style="{'font-weight': 'bold','text-align': 'center'}">{{ $t("recharge.experience_membership") }}</p>
            </div>
            <p class="vip-recharge1--remaining-time">
              {{ dayJS(userInfo.getUserInfo.user?.createTime).format("YYYY/MM/DD")
              }} - {{ dayJS(userInfo.getUserInfo.user?.expirationTime).format("YYYY/MM/DD") }}
            </p>
            <div class="remaining-time">
              <p style="font-size: 18px">{{ $t("recharge.remaining_time") }}：</p>
              <div class="subscription-center--progress">
                <el-progress stroke-width="10" :percentage="getPercent || 0" :show-text="false" style="margin: 5px 0" />
                <el-popover width="240px">
                  <template #default>
                    <p v-for="(it,i) of getCurrentExperienceRole" :key="i" style="font-size: 14px">
                      ·{{ it }}
                    </p>
                  </template>
                  <template #reference>
                    <el-icon class="subscription-center--progress-icon">
                      <InfoFilled />
                    </el-icon>
                  </template>
                </el-popover>
              </div>
              <p style="color: #a9a9a9;text-align: center">{{ timeLeftVipDate }}</p>
            </div>
          </div>
          <div class="subscription-status" v-for="(item, index) of vips" :key="index">
            <div :class="{'subscription-center--line':true, vvip:isVVip(item)}">
              <!--              <img :src="isVVip(item)? vip2Remark:vip1Remark" alt="vip" />-->
              <p style="font-weight: bold" :class="{vvip:isVVip(item)}">
                <span>{{ rechargeList.find(it => String(it.id) === String(item.level))?.name }} </span>
                <span style="font-size: 30px;margin-left: 5px">
                  <span style="font-size: 18px">{{ item.price?.[0] }}</span>{{ item.price?.replace(/^./, "") }}</span>
              </p>
            </div>
            <p :class="{'vip-recharge1--remaining-time':true, 'vip-recharge1--remaining-time2':isVVip(item) }">
              {{ dayJS(item.member.createTime).format("YYYY/MM/DD") }} -
              {{ dayJS(item.member.expirationTime).format("YYYY/MM/DD") }}
            </p>
            <div class="remaining-time" v-if="item.member?.level === String(maxItemId)">
              <p style="font-size: 18px;color:#414D5F;font-weight: normal">{{ $t("recharge.remaining_time") }}：</p>
              <div class="subscription-center--progress">
                <el-progress :percentage="item._vipLeftPercent || 0" :show-text="false" style="margin: 5px 0"
                             :stroke-width="10" />
                <el-popover width="240px">
                  <template #default>
                    <p v-for="(it,i) of getCurrentRole" :key="i" style="font-size: 14px">
                      ·{{ it }}
                    </p>
                  </template>
                  <template #reference>
                    <el-icon class="subscription-center--progress-icon">
                      <InfoFilled />
                    </el-icon>
                  </template>
                </el-popover>
              </div>
              <p style="color: #414D5F;text-align: center;font-weight: 400">{{ item._vipLeft }}</p>
            </div>
          </div>
          <div v-if="userInfo.getUserInfo.user?.userType !== USER_TYPE.VISITOR && vips.length < 1 && false"
               class="is-not-member">
            {{ $t("recharge.non-member") }}
          </div>
        </div>
      </div>

      <!-- 右侧部分：订阅选项卡 -->
      <el-scrollbar class="right-scroll-part">
        <div class="right-scroll-part--wrapper">
          <div class="subscription-options" v-for="(item,index) of rechargeList" :key="index">
            <img src="@/assets/ai-icon.png" alt="Ai" class="ai-logo" v-if="index>0" />
            <div :class="{active_item_border:true, active_item_border_gold:index > 0}" v-if="isCurrent(item)">
              {{ $t("recharge.currently_using") }}
            </div>
            <div :class="{'option-card':true,premium: index>0}">
              <h2 style="margin-block-start: 25px;margin-block-end: 0;font-size: 26px">{{ item.name }}</h2>
              <div class="option-card-header">
                <!--            <img :src="index>0? vip2Remark:vip1Remark" alt="vip" class="option-card&#45;&#45;img" />-->
                <div class="option-card--right">
                  <h2 class="price">
                    <span class="symbol">{{ item.currencyTypes.symbol }}</span>
                    <span class="number" style="position: relative; transform: translateY(10px) ">{{ item.cost }}</span>
                  </h2>
                </div>
                <div class="vip-explain">
                  <p :style="{color:index>0? '#796438':'#627FBD'}">{{ $t("recharge.charged_monthly_per_host") }}</p>
                  <p :style="{color:index>0? '#796438':'#627FBD'}">{{ $t("recharge.monthly_per_host") }}</p>
                </div>
              </div>
              <div class="vip2-explain" :style="{color:index>0? '#796438':'#627FBD'}">
                {{ item.currencyTypes.symbol }}{{ item.cost * 12 }}{{ $t("recharge.per_year_license") }}
              </div>
              <el-button class="buy-btn" @click="onCreateOrder(item.id)" :loading="rechargeLoading">
                {{ $t("recharge.buy_now") }}
              </el-button>
              <ul class="features" :style="{width: locale.locale.value === 'en'? '80%':'55%'}">
                <li v-for="(it,i) of item.privilegesList" :key="i" style="position: relative">
                  <el-image class="li-eye" :src="index>0? goldEyeIcon : blueEyeIcon" alt="eye" fit="contain"
                            @click="showMessage" />
                  <span>{{ it.remark }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>

  <MessageBox v-model:visible="showConfirm"
              :confirm-text="$t('recharge.subscribe')"
              :cancel-text="$t('universal.cancel')"
              @confirm="onCreateOrderContinue"
              @cancel="showConfirm = false"
              :content="updateRechargeTips" />
  <message-box v-model:visible="showStatusCallback" :confirm-text="$t('universal.confirm')" @confirm="onDone">
    <p style="font-size: 18px;color: #3f1107">{{ getStatus }}</p>
  </message-box>
  <message-box v-model:visible="showTipsMessage" :confirm-text="$t('universal.confirm')"
               @confirm="showTipsMessage = false">
    {{ $t("recharge.not_available") }}
  </message-box>
  <LoadingComponent :show="loading" />
</template>

<script setup lang="tsx">
import { InfoFilled } from "@element-plus/icons-vue";
import { computed, onMounted, ref, watch } from "vue";
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import { fetchMemberInfo, fetchRechargeList } from "@/http/subscript";
import { fetchUserInfo } from "@/http/user";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import type { User } from "@/interface/User";
import { USER_TYPE } from "@/enum";
import dayJS from "dayjs";
import { fetchOrderCreate, fetchOrderStatus, fetchPayCreate } from "@/http/order";
import { useAuth } from "@/libs/useAuth";
import { useRoute } from "vue-router";
import duration from "dayjs/plugin/duration";
import { useI18n } from "vue-i18n";
import blueEyeIcon from "@/assets/blue-eye.png";
import goldEyeIcon from "@/assets/gold-eye.png";

dayJS.extend(duration);

type Status = 0 | 1 | 2 | 3;

interface CurrencyTypes {
  currencycode: string;
  currencyname: string;
  symbol: string;
}

interface PrivilegesList {
  id: number;
  remark: string;
}

interface Vips {
  member: {
    createTime: number
    expirationTime: number
    id: number
    level: string
    rechargeTime: number
  };
  level: string;
  price: string;
  name: string;
  _vipLeftPercent: number;
  _vipLeft: string;
}

interface Data {
  cost: number;
  costunit: string;
  createtime: number;
  currencyTypes: CurrencyTypes;
  id: number;
  istime?: number;
  isy?: number;
  jurisdiction: string;
  originalprice: number;
  privilegesList: PrivilegesList[];
  vip: number;
  name: string;
  vipunit: "Day" | "Month" | "Year";
}

const { t } = useI18n();
const locale = useI18n();
const status = ref<Status>();
const rechargeList = ref<Data[]>([]);
const loading = ref(false);
const timeLeftVipDate = ref<string>();
const rechargeLoading = ref(false);
const timeVipCreate = ref<string>();
const timeVipExpire = ref<string>();
const timeLeftVip = ref<number>();
const timeLeftVipPercent = ref<number>();
const vips = ref<Vips[]>([]);
const showStatusCallback = ref(false);
const updateRechargeTips = ref("");
const user = useAuth();
const route = useRoute();
const launchLoading = ref(false);
const showTipsMessage = ref(false);

const emit = defineEmits<{
  (ev: "done"): void
}>();
const getStatus = computed(() => {
  let result;
  switch (Number(status.value)) {
    case 0:
      result = t("recharge.pending_payment");
      break;
    case 1:
      result = t("recharge.recharge_successful");
      break;
    case 2:
      result = t("recharge.recharge_cancel");
      break;
    case 3:
      result = t("recharge.refunded");
      break;
    default:
      result = "UNKNOWN STATUS";
  }
  return result;
});


const props = withDefaults(defineProps<{
  isComponent?: boolean
}>(), {
  isComponent: false
});
const isVVip = (item: Vips) => {

  return rechargeList.value.findIndex(it => it.id === Number(item.member.level)) > 0;
};
const userInfo = useUserInfo();
const showConfirm = ref(false);


const getPercent = computed(() => {
  return Math.ceil(((timeLeftVip.value as number) / (timeLeftVipPercent.value as number)) * 100);
});
const isCurrent = (item: Data) => {
  const members = vips.value.filter(item => item.member.expirationTime > Date.now());

  return members.some(it => it.member.level === String(item.id));
};
const maxItemId = ref<number>();
const minItemId = ref<number>();
let currentClickRechargeId = 0;
const onCreateOrder = (id: number) => {
  currentClickRechargeId = id;
  const currentMembers = (vips.value || []).filter(it => it.member.expirationTime > Date.now());
  if (currentMembers.length > 0 && currentMembers.find(it => it.level === String(id)) === undefined) {
    let vipText = "";
    for (let i = 0; i < currentMembers.length; i++) {
      vipText += currentMembers[i].price + (i === currentMembers.length - 1 ? " " : "、");
    }
    updateRechargeTips.value = `${t("recharge.currently_have")}${vipText}${t("recharge.subscribe")}，${t("recharge.renew")}?`;
    showConfirm.value = true;
  } else {
    onCreateOrderContinue(id);
  }
};
const showMessage = () => {

  //showTipsMessage.value = true;
};
const onCreateOrderContinue = (id?: number) => {
  rechargeLoading.value = true;
  fetchOrderCreate({
    userId: route.query.userId || userInfo.getUserInfo.user?.id,
    payId: id || currentClickRechargeId
  }).then((res: { code: 200 | 500, data: { id: number, orderId: string } }) => {
    if (res && res.code === 200) {
      onCreatePay(res.data.orderId);
    }
  }).finally(() => rechargeLoading.value = false);
  showConfirm.value = false;
};
let windowsInstance: any = null;
const onCreatePay = (orderId: string) => {
  loading.value = true;
  fetchPayCreate({
    orderId,
    userId: route.query.userId || userInfo.getUserInfo.user?.id
  }).then((res: { code: 200 | 500, data: any }) => {
    if (res && res.code === 200) {
      windowsInstance = window.open(res.data, "_blank", "width=800,height=600,left=300,top=200");
      getOrderStatus(orderId);

    }
  }).finally(() => loading.value = false);
};
let timeout: any;
const getOrderStatus = (orderId: string) => {
  fetchOrderStatus({ orderId }).then((res: any) => {

    if (res && res.code === 200) {
      status.value = Number(res.data?.status) as Status;
      if (String(res.data?.status) === "0") {
        timeout = setTimeout(() => {
          getOrderStatus(orderId);
        }, 2000);
      } else {
        clearTimeout(timeout);
        windowsInstance?.close();
        showStatusCallback.value = true;
        setMemberInfo();
        setUserInfo();
      }
    } else {
      timeout = setTimeout(() => {
        getOrderStatus(orderId);
      }, 3000);
    }
    if (windowsInstance?.closed && status.value === 0) {
      clearTimeout(timeout);
      status.value = 2;
      showStatusCallback.value = true;
    }

  }).catch(e => {
    timeout = setTimeout(() => {
      getOrderStatus(orderId);
    }, 3000);
  });
};
const setDataSource = () => {
  if (!route.query.userId && !userInfo.getUserInfo?.user?.id) {
    return;
  }
  loading.value = true;
  launchLoading.value = true;
  fetchRechargeList().then((res: Http.Response<Data[]>) => {
    rechargeList.value = res.data.filter((_, i) => i >= 0)
      .sort((a: any, b: any) => a.originalprice > b.originalprice ? 1 : -1);
    minItemId.value = Math.min(...(res.data || []).map(item => item.id));
  }).finally(() => {
    loading.value = false;
    launchLoading.value = false;
  });
}

const setUserInfo = () => {
  if (!route.query.userId && !userInfo.getUserInfo?.user?.id) {
    return;
  }
  launchLoading.value = true;
  fetchUserInfo({
    userId: (route.query.userId || userInfo.getUserInfo?.user?.id) as number
  }).then((res: { code: 200 | 500, data: User.UserInfo & { paymentSettings: any[] } }) => {
    if (res && res.code === 200) {
      userInfo.setUserInfo("nickname", res.data.nickname);
      userInfo.setUserInfo("roleId", res.data.roleId);
      userInfo.setUserInfo("username", res.data.username);
      userInfo.setUserInfo("id", res.data.id);
      userInfo.setUserInfo("userType", res.data.userType);
      userInfo.setUserInfo("createTime", res.data.createTime);
      userInfo.setUserInfo("expirationTime", res.data.expirationTime);
      userInfo.setUserInfo("uequipment", res.data.uequipment);
      userInfo.setUserInfo("wequipment", res.data.wequipment);
      userInfo.setUserInfo("userType", res.data.userType);
      userInfo.setUserInfo("privileges", res.data.privileges);
      userInfo.setUserInfo("remark", res.data.remark);
      maxItemId.value = Math.max(...(res.data.members || [])
        .filter((it: any) => it.expirationTime > Date.now())
        .map((it: any) => Number(it.level)));
      user.setUserData({ ...res.data });
      if (res.data.paymentSettings) {
        const arr = res.data.paymentSettings.find(it => String(it.id) === String(maxItemId.value))?.privilegesList;
        if (arr) {
          userInfo.setPrivileges(arr as { id: number; remark: string; }[]);
          user.privileges = arr;
        }
      }
      if (res.data.userType === USER_TYPE.VISITOR) {
        timeVipCreate.value = dayJS(res.data.createTime).format("YYYY-MM-DD HH:mm:ss");
        timeVipExpire.value = dayJS(res.data.expirationTime).format("YYYY-MM-DD HH:mm:ss");
        const date1 = dayJS(res.data.expirationTime);
        const date2 = dayJS(Date.now());
        const date3 = dayJS(res.data.createTime);
        timeLeftVipPercent.value = Math.abs(date1.diff(date3, "day"));
        timeLeftVipDate.value = getResidueDate(Date.now(), res.data.expirationTime as number);
        timeLeftVip.value = date1.diff(date2);
      }
    }
  }).finally(() => launchLoading.value = false);
};
const getCurrentRole = computed(() => {
  const item = rechargeList.value.find((it: Data) => String(it.id) === String(maxItemId.value));
  if (item) {
    return item.privilegesList.map((it: PrivilegesList) => it.remark);
  }
  return [];
});
const getCurrentExperienceRole = computed(() => {
  if (rechargeList.value) {

    const rl = JSON.parse(JSON.stringify(rechargeList.value));
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    const item = rl.sort((a: any, b: any) => b.originalprice - a.originalprice)[0];
    if (item) {
      return item.privilegesList.map((it: PrivilegesList) => it.remark);
    }
  }

  return [];
});
const onDone = () => {
  showStatusCallback.value = false;
  emit("done");
};

// 传递过来的都是时间戳
const getResidueDate = (start_date: number, end_date: number) => {
  if (start_date >= end_date) return t("recharge.expired");
  let residue = end_date - start_date;
  let days: string | number = Math.floor(residue / 1000 / 60 / 60 / 24);
  let hours: string | number = Math.floor((residue / 1000 / 60 / 60) % 24);
  let minutes: string | number = Math.floor((residue / 1000 / 60) % 60);
  // let seconds = Math.floor((residue / 1000) % 60);

  // 不需要补零的话，这部分就可以不用了
  // days = days < 10 ? "0" + days : days;
  // hours = hours < 10 ? "0" + hours : hours;
  // minutes = minutes < 10 ? "0" + minutes : minutes;
  // seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${days} ${t("universal.day")} ${hours} ${t("universal.hour")} ${minutes} ${t("universal.minute")}`;
};
const setMemberInfo = () => {
  if (!route.query.userId && !userInfo.getUserInfo?.user?.id) {
    return;
  }
  launchLoading.value = true;
  fetchMemberInfo({
    userId: route.query.userId || userInfo.getUserInfo.user?.id
  }).then((res: Http.Response<any>) => {
    if (res && res.code === 200 && res.data.length > 0) {
      const _vips = res.data.map((item:any) => {
        const date1 = dayJS(Date.now());
        const date2 = dayJS(item.member.expirationTime);
        const date3 = dayJS(item.member.createTime);

        const _date = getResidueDate(Date.now(), item.member.expirationTime);
        return {
          ...item,
          level: item.member.level,
          name: item.name,
          _vipLeft: `${_date}`,
          _vipLeftPercent: (Math.abs(date1.diff(date2, "day")) / Math.abs(date2.diff(date3, "days"))) * 100
        };
      });
      //@ts-ignore
      vips.value = Array.from(new Map(_vips.map(item => [item.price, item])).values());


    }
  }).finally(() => launchLoading.value = false);
};

onMounted(() => {
  setUserInfo();
  setDataSource();
  setMemberInfo();
});
watch(loading, newVal => {
  if (newVal) setTimeout(() => loading.value = false, 8000);
});
</script>

<style scoped lang="scss">
.subscription-center {
  display: flex;
  height: 700px;
  justify-content: flex-start;
  flex-flow: row nowrap;
  width: 100%;
  box-sizing: border-box;
  //max-height: 690px;
}

.subscription-center-component {
  height: 800px;
  min-height: 695px;
}

.sidebar {
  width: 280px;
  background-color: #fff;
  margin-right: 30px;
  padding: 20px;
  border-radius: 10px;
  min-height: 280px;
}

.user-info {
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #a1a1a1;
}

.user-title {
  font-size: 1.2rem;

  font-weight: bold;
}

.subscription-status {
  margin-top: 20px;
}

.remaining-time {
  margin: 40px auto 0 auto;
  font-weight: 600;
  text-align: left;
  font-size: 14px;
  width: 230px;

}

.ai-logo {
  width: 80px;
  height: 80px;
  position: absolute;
  right: 8px;
  top: 8px;

}

.subscription-options {
  width: 430px;
  display: flex;
  justify-content: space-around;
  padding: 20px 20px 0 20px;
  box-sizing: border-box;
  background-color: #fff;
  flex-shrink: 0;
  position: relative;
  height: 100%;
  overflow: hidden;

}

.active_item_border, .active_item_border_gold {
  background: linear-gradient(90deg, #69B1FE, #6098FC, #4F70F8);
  border-radius: 25px 0px 25px 0px;
  position: absolute;
  z-index: 1;
  left: 25px;
  top: 20px;
  font-size: 18px;
  width: 155px;
  height: 40px;
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active_item_border_gold {
  background: linear-gradient(90deg, #F5B225, #E7972B, #D2742C);
}

.vvip {
  color: #FF632D;
}

.option-card {
  background-color: #ffffff;
  border-radius: 10px;
  text-align: center;
  background-image: url("@/assets/recharge-center-bg-vip1.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #4061AC;
  padding: 20px 40px;
  width: 100%;
}

.option-card h2.price {
  font-size: 3rem;
  color: #4061AC;
  margin: 15px 0 0 0;
  text-align: right;

}

.option-card.premium h2.price {
  color: #483720;
}

.subscription-center--scroll {
  height: calc(100% - 120px);
  display: flex;
  justify-content: flex-start;
}
.subscription-center--scroll-com {
  height: 550px;
  overflow-y: auto;
}
.buy-btn {
  color: #fff;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  margin: 0 0 0 0;
  background: #4061AC;
  box-shadow: 0px 11px 12px 0px rgba(88, 145, 231, 0.7);
  border-radius: 4px;
  width: 100%;
  height: 50px;
  font-size: 25px;
  transform: translateY(10px);
}

.price .number {
  font-size: 90px;
}

.option-card-option {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-image: url(/src/assets/recharge-center-bg-vip2.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #4061AC;
}

.premium .buy-btn {
  background-color: #AD7825;
  box-shadow: 0px 11px 12px 0px rgba(173, 120, 37, .7);
}

.features {
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
  text-align: left;
  display: inline-block;
  font-size: 19px;
  transform: translateY(20px);
}

.features li {
  margin: 5px 0;
  list-style-type: disc;
}

.subscription-center--line {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  color: #81ADDF;
  padding-left: 20px;
}

.subscription-center--line img {
  width: 50px;
}

.vip-recharge1--remaining-time {
  background-color: #5D91FB;
  color: #fff;
  border-radius: 10px;
  width: 230px;
  margin: 5px auto;
}

.vip-recharge1--remaining-time2 {
  background-color: #F4AB1E;
  color: #fff;
  border-radius: 10px;
  width: 230px;
  margin: 5px auto;
}

.subscription-center--progress {
  display: grid;
  grid-template-columns: 9fr 1fr;
  justify-content: space-between;
}

.subscription-center--progress-icon {
  justify-self: flex-end;
  cursor: pointer;
  color: #414D5F;
  margin-top: 2px;
}

.subscription-center--title {
  padding: 20px 0;
  text-align: center;
  font-size: 24px;
  border-radius: 6px;
  font-weight: 400;
  background-color: #fff;
  margin: 0 0 15px 0;
  color: #414D5F;
}

.option-card-header {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  height: 110px;
  align-content: center;
  transform: translateY(4px);
}

.symbol {
  font-size: 46px;
  display: inline-block;
  transform: translateY(-5px);
}

.vip-explain {
  text-align: left;
  font-size: 16px;
  align-items: center;
  align-self: center;
}

.vip2-explain {
  text-align: center;
  transform: translateY(-10px);
  font-size: 18px;
}

.premium {
  color: #483720;
  box-sizing: border-box;
  background-image: url(/src/assets/recharge-center-bg-vip2.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;

}

.option-card--img {
  width: 100%;
  max-width: 100%;
  justify-self: flex-end;
  align-self: center;
  transform: translateY(5px);
}

.option-card--right {
  align-self: center;
  justify-self: center;
  transform: translateY(-25px) translateX(15px);
}


@keyframes show-confirm {
  from {
    transform: scale(0.50);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.right-scroll-part {
  min-height: 800px;
  width: calc(100% - 304px);
  border-radius: 10px;

}

.right-scroll-part:deep(.el-scrollbar__view) {
  height: 100%;
}

.right-scroll-part--wrapper {
  display: flex;
  justify-content: flex-start;
  height: 100%;
  background-color: #fff;
}

.is-not-member {
  padding: 80px 0;
  font-size: larger;
  font-weight: 600;
  color: #1383d2;
  text-decoration: underline;
}

.li-eye {
  width: 16px;
  left: 0;
  top: 11px;
  transform: translateX(-50px);
  position: absolute;
  z-index: 1;
  cursor: pointer;
}
</style>
