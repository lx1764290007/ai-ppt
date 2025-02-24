

<template>
  <div class="sidebar">
    <div class="user-info">
      <el-image   alt="icon"
                  :style="{'border-radius': '50%',width:'70px',height: '70px','background-color': userInfo.getUserInfo.user?.remark?.endsWith('default.png')? 'transparent' : 'rgba(0,0,0,.3)'}"
                  :src="userInfo.getUserInfo.user?.remark" fit="contain"  />
      <div class="user-title">
        {{ userInfo.getUserInfo.user?.nickname }}
      </div>
      <div class="subscription-status" v-if="userInfo.getUserInfo.user?.userType === USER_TYPE.VISITOR">
        <div class="subscription-center--line">
<!--          <img src="@/assets/vip-recharge.png" alt="vip" />-->
          <!--              <p v-if="!timeVipExpire" style="font-weight: bold">$<span style="font-size: 30px">10</span></p>-->
          <p style="font-weight: bold;text-align: center">
            {{$t('recharge.experience_membership')}}
          </p>
        </div>
        <p class="vip-recharge1--remaining-time">
          {{ dayJS(userInfo.getUserInfo.user?.createTime).format("YYYY/MM/DD")
          }} - {{ dayJS(userInfo.getUserInfo.user?.expirationTime).format("YYYY/MM/DD") }}
        </p>
        <div class="remaining-time">
          <p style="font-size: 18px">{{$t('recharge.remaining_time')}}：</p>
          <div class="subscription-center--progress">
            <el-progress :percentage="getPercent || 0" :show-text="false" style="margin: 5px 0" :stroke-width="10" />
            <el-popover width="240px">
              <template #default>
                <p v-for="(it,i) of getCurrentExperienceRole" :key="i" style="font-size: 14px">
                  ·{{it}}
                </p>
              </template>
              <template #reference>
                <el-icon class="subscription-center--progress-icon">
                  <InfoFilled />
                </el-icon>
              </template>
            </el-popover>
          </div>
          <p style="color: #a9a9a9;text-align: center">{{timeLeftVipDate}}</p>
        </div>
      </div>
      <div class="subscription-status" v-for="(item, index) of vips" :key="index">
        <div :class="{'subscription-center--line':true, vvip:isVVip(item)}">
<!--          <img :src="isVVip(item)? vip2Remark:vip1Remark" alt="vip" />-->
          <p style="font-weight: bold" :class="{vvip:isVVip(item)}">
            <span>{{rechargeList.find(it=> String(it.id) === String(item.level))?.name}} </span>
            <span style="font-size: 30px;margin-left: 5px">
            {{ item.price }}
            </span>
          </p>
        </div>
        <p :class="{'vip-recharge1--remaining-time':true, 'vip-recharge1--remaining-time2':isVVip(item) }">
          {{ dayJS(item.member.createTime).format("YYYY/MM/DD") }} -
          {{ dayJS(item.member.expirationTime).format("YYYY/MM/DD") }}
        </p>
        <div class="remaining-time" v-if="item.member?.level === String(maxItemId)">
          <p style="font-size: 18px">{{$t('recharge.remaining_time')}}：</p>
          <div class="subscription-center--progress">
            <el-progress :percentage="item._vipLeftPercent || 0" :show-text="false" style="margin: 5px 0"
                         :stroke-width="10" />
            <el-popover width="240px">
              <template #default>
                <p v-for="(it,i) of getCurrentRole" :key="i" style="font-size: 14px">
                  ·{{it}}
                </p>
              </template>
              <template #reference>
                <el-icon class="subscription-center--progress-icon">
                  <InfoFilled />
                </el-icon>
              </template>
            </el-popover>
          </div>
          <p style="color: #a9a9a9;text-align: center">{{ item._vipLeft }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { InfoFilled } from "@element-plus/icons-vue";
import { computed, onMounted, ref, watch } from "vue";

import { fetchMemberInfo, fetchRechargeList } from "@/http/subscript";
import { fetchUserInfo } from "@/http/user";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";


import type { User } from "@/interface/User";
import { USER_TYPE } from "@/enum";
import dayJS from "dayjs";
import { useAuth } from "@/libs/useAuth";
import { useRoute } from "vue-router";
import duration from "dayjs/plugin/duration";
import { useI18n } from "vue-i18n";

dayJS.extend(duration);
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
  level: string
  price: string;
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
  name: string
  isy?: number;
  jurisdiction: string;
  originalprice: number;
  privilegesList: PrivilegesList[];
  vip: number;
  vipunit: "Day" | "Month" | "Year";
}


const rechargeList = ref<Data[]>([]);
const loading = ref(false);
const timeLeftVipDate = ref<string>();
const {t} = useI18n();
const timeVipCreate = ref<string>();
const timeVipExpire = ref<string>();
const timeLeftVip = ref<number>();
const timeLeftVipPercent = ref<number>();
const vips = ref<Vips[]>([]);

const user = useAuth();
const route = useRoute();
const launchLoading = ref(false);

const emit = defineEmits<{
  (ev: "done"): void
}>();



 withDefaults(defineProps<{
  isComponent?: boolean
}>(), {
  isComponent: false
});
const isVVip = (item: Vips) => {
  return rechargeList.value.findIndex(it => it.id === Number(item.member.level)) > 0;
};

const userInfo = useUserInfo();

const getPercent = computed(() => {
  return Math.ceil(((timeLeftVip.value as number) / (timeLeftVipPercent.value as number)) * 100);
});

const maxItemId = ref<number>();
const minItemId = ref<number>();

const setDataSource = () => {
  loading.value = true;
  launchLoading.value = true;
  fetchRechargeList().then((res: Http.InfoListData<Data>) => {
    rechargeList.value = res.data.filter((_, i) => i >= 0);
    minItemId.value = Math.min(...(res.data || []).map(item => item.id)) ;
  }).finally(() => {
    loading.value = false;
    launchLoading.value = false;
  });
};

const setUserInfo = () => {
  launchLoading.value = true;
  fetchUserInfo({
    userId: (route.query.userId || userInfo.getUserInfo?.user?.id) as number
  }).then((res: { code: 200 | 500, data: User.UserInfo }) => {
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

      user.setUserData(res.data);
      if (res.data.userType === USER_TYPE.VISITOR) {
        timeVipCreate.value = dayJS(res.data.createTime).format("YYYY-MM-DD HH:mm:ss");
        timeVipExpire.value = dayJS(res.data.expirationTime).format("YYYY-MM-DD HH:mm:ss");
        const date1 = dayJS(res.data.expirationTime);
        const date2 = dayJS(Date.now());
        const date3 = dayJS(res.data.createTime);
        timeLeftVipPercent.value = Math.abs(date1.diff(date3, "day"));
        timeLeftVipDate.value = getResidueDate(Date.now(), res.data.expirationTime as number);
        timeLeftVip.value =  date1.diff(date2);
      }
    }
  }).finally(()=> launchLoading.value = false);
};
const getCurrentRole = computed(()=> {
  const item = rechargeList.value.find((it: Data) => String(it.id) === String(maxItemId.value));
  if(item) {
    return item.privilegesList.map((it: PrivilegesList) => it.remark)
  }
  return []
})
const getCurrentExperienceRole = computed(()=> {
  if(rechargeList.value){

    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    const item = rechargeList.value.sort((a, b) => b.cost - a.cost)[0];
    if(item) {
      return item.privilegesList.map((it: PrivilegesList) => it.remark)
    }
  }

  return []
})


// 传递过来的都是时间戳
const getResidueDate= (start_date:number, end_date:number)=>{
  if(start_date >= end_date) return  t('recharge.expired');
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

  return `${days} ${t('universal.day')} ${hours} ${t('universal.hour')} ${minutes} ${t('universal.minute')}`;
}
const setMemberInfo = () => {
  launchLoading.value = true;
  fetchMemberInfo({
    userId: route.query.userId || userInfo.getUserInfo.user?.id
  }).then((res: Http.InfoListData<Vips>) => {
    if (res && res.code === 200 && res.data.length > 0) {
      const _vips = res.data.map(item => {
        const date1 = dayJS(Date.now());
        const date2 = dayJS(item.member.expirationTime);
        const date3 = dayJS(item.member.createTime);
        const _date = getResidueDate(Date.now(), item.member.expirationTime);
        return {
          ...item,
          level: item.member.level,
          _vipLeft: `${_date}`,
          _vipLeftPercent: (Math.abs(date1.diff(date2, "day")) / Math.abs(date2.diff(date3, "days"))) * 100
        };
      });
      vips.value = Array.from(new Map(_vips.map(item => [item.price, item])).values());


    }
  }).finally(()=> launchLoading.value = false);
};

onMounted(() => {
  if(route.query.userId || userInfo.getUserInfo?.user?.id) {
    setUserInfo();
    setDataSource();
    setMemberInfo();
  }
});
watch(loading, newVal => {
  if (newVal) setTimeout(() => loading.value = false, 8000);
});
</script>

<style scoped>
.sidebar {
  background-color: #fff;
  width: 230px;
  padding: 20px;
  border-radius: 10px;
  min-height: 280px;
  transform: scale(0.9) translateX(-8px) translateY(-25px);
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

.vvip {
  color: #FF632D;
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
  padding-left: 2px;
}

.subscription-center--line img {
  width: 50px;
}

.vip-recharge1--remaining-time {
  background-color: #5D91FB;
  color: #fff;
  border-radius: 10px;
  width: 230px;
  margin: 15px auto;
}

.vip-recharge1--remaining-time2 {
  background-color: #F4AB1E;
  color: #fff;
  border-radius: 10px;
  width: 230px;
  margin: 15px auto;
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


</style>
