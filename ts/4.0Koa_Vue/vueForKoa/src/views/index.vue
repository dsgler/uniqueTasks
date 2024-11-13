<script setup lang="ts">
import { useJWTStore } from '@/stores/JWT';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { type Ref, ref } from 'vue';

type getinfo_resp_type = {
    err: string | null;
    info: { username: string; email: string } | null;
};
interface carryJWT {
  rawJWT: string;
}

let router = useRouter();
let route = useRoute();
let JWTstore = useJWTStore();
function empty_JWT_and_route_to_login() {
    JWTstore.JWT = "";
    info.value!.username="请稍后，将跳转回主页";
    setTimeout(()=>{router.push("/login");},1000);
}
if (JWTstore.JWT === "") {
    empty_JWT_and_route_to_login();
}

let info: Ref<getinfo_resp_type["info"]> = ref({ username: "", email: "" });
function show_info() {
    let req = axios.post("http://localhost:3000/getinfo",<carryJWT>{rawJWT:JWTstore.JWT})
    req.then((resp) => {
        let ret = <getinfo_resp_type>resp.data;
        if (ret.err === null) {
            info.value!.username = ret.info!.username;
            info.value!.email = ret.info!.email;
        } else {
            info.value!.username = ret.err;
            setTimeout(empty_JWT_and_route_to_login, 3000);
        }
    }, (err) => {
        info.value!.username = err;
        setTimeout(empty_JWT_and_route_to_login, 3000);
    })
}

show_info();


</script>

<template>
    <div>欢迎用户：{{ info?.username }}</div>
    <div>您的邮箱为：{{ info?.email }}</div>
    <div><a href="javasript:void" @click="()=>{empty_JWT_and_route_to_login()}">注销</a></div>

</template>

<style scoped></style>