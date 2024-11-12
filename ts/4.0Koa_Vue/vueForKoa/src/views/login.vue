<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { useJWTStore } from '@/stores/JWT';

type base64urlString = string;
type register_body_type = {
    username: string;
    email: string;
    passwd: base64urlString;
};
type register_resp_type = { err: string | null };
type login_body_type = { username: string; passwd: base64urlString };
type login_resp_type = { err: string | null; rawJWT: base64urlString | null };

let JWTstore = useJWTStore();
let username = ref("");
let email = ref("");
let passwd = ref("");
let passwd_confirm = ref("");
let button_disable = ref(false);
let router = useRouter();
let route = useRoute();
let isRegister = computed(() => {
    return route.name === "register";
})


async function sha256Base64URL(message: string): Promise<string> {
    // 将字符串转换为ArrayBuffer
    const msgBuffer = new TextEncoder().encode(message);
    // 计算SHA-256哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // 将ArrayBuffer转换为Base64字符串
    const hashBase64 = btoa(String.fromCharCode.apply(null, <number[]><unknown>new Uint8Array(hashBuffer)));
    // 将Base64转换为Base64URL
    const hashBase64URL = hashBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return hashBase64URL;
}

function validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

async function commit_register_form() {
    if (username.value === "" || passwd.value === "" || passwd_confirm.value === "") {
        message_set(2, "字段不能为空！");
        return;
    }
    if (!validateEmail(email.value)) {
        message_set(2, "邮箱格式错误！");
        return;
    }
    if (username.value.length >= 15 || email.value.length >= 20) {
        message_set(2, "用户名或邮箱过长！");
        return;
    }
    if (passwd.value !== passwd_confirm.value) {
        message_set(2, "两次密码不一样！");
        return;
    }
    button_disable.value = true;
    // 防止一直被禁用
    setTimeout(() => { button_disable.value = false }, 30000);
    passwd.value = await sha256Base64URL(passwd.value);
    passwd_confirm.value = passwd.value;
    let postObj: register_body_type = { username: username.value, email: email.value, passwd: passwd.value };
    message_set(3, "加载中");
    passwd.value = "";
    passwd_confirm.value = "";
    axios.post("http://localhost:3000/register", postObj).then((resp) => {
        let ret = <register_resp_type>resp.data;
        if (ret.err === null) {
            message_set(1, "注册成功");
            router.push("/login")
        } else {
            message_set(2, ret.err);
        }
    }, (err => {
        message_set(2, err);
    })).finally(() => {
        button_disable.value = false;
    })
}

async function commit_login_form() {
    if (username.value === "" || passwd.value === "") {
        message_set(2, "字段不能为空！");
        return;
    }
    button_disable.value = true;
    // 防止一直被禁用
    setTimeout(() => { button_disable.value = false }, 30000);
    passwd.value = await sha256Base64URL(passwd.value);
    let postObj: login_body_type = { username: username.value, passwd: passwd.value };
    axios.post("http://localhost:3000/login", postObj).then((resp) => {
        let ret = <login_resp_type>resp.data;
        if (ret.err === null) {
            message_set(1, "登录成功");
            JWTstore.JWT = ret.rawJWT!;
            setTimeout(() => { router.push("/"); }, 3000);
        } else {
            message_set(2, ret.err!);
            button_disable.value = false;

        }
    }, (err) => {
        message_set(2, err);
        button_disable.value = false;

    })
}

let message_status = ref(0);
const classObject = computed(() => ({
    success: message_status.value === 1,
    error: message_status.value === 2,
    loading: message_status.value === 3,
}))
let message_text = ref("");

function message_set(status: number, str: string) {
    message_status.value = status;
    message_text.value = str;
}

// message_set(1, <string>route.name);
</script>

<template>
    <div class="container">
        <div class="card_container">
            <div class="form_row" id="message_row">
                <div class="form_label"></div>
                <div id="message" :class="classObject">{{ message_text }}</div>
            </div>
            <div class="form_row">
                <div class="form_label">账号</div>
                <input type="text" placeholder="请输入账号" v-model.lazy="username" class="myinput" />
            </div>
            <div class="form_row" v-if="isRegister">
                <div class="form_label">邮箱</div>
                <input type="text" placeholder="请输入邮箱" v-model.lazy="email" class="myinput" />
            </div>
            <div class="form_row">
                <div class="form_label">密码</div>
                <input type="password" placeholder="请输入密码" v-model.lazy="passwd" class="myinput" />
            </div>
            <div class="form_row" v-if="isRegister">
                <div class="form_label">确认密码</div>
                <input type="password" placeholder="再次输入账号" v-model.lazy="passwd_confirm" class="myinput" />
            </div>
            <div class="form_row">
                <div class="form_label"></div>
                <div style="display: flex;width: 100%;justify-content: center;">
                    <button @click="() => { if (isRegister) { commit_register_form() } else { commit_login_form() } }"
                        :disabled="button_disable" :class="{ disabled: button_disable }">提交</button>
                </div>
            </div>
            <div class="form_row" style="display: flex;justify-content: space-around;">
                <RouterLink to="/register">注册</RouterLink>
                <RouterLink to="/login">登录</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    flex-direction: row;
    height: 100vh;
    align-items: center;
}

.card_container {
    position: relative;
    box-sizing: border-box;
    width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 50px 30px 25px;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
}

.form_row {
    width: 100%;
    display: flex;
    flex-direction: row;
    height: 2em;
    justify-content: center;
    padding: 10px 0px;
}

.form_label {
    width: 7em;
    text-align: end;
    padding-right: 1em;
}

.myinput {
    width: 100%;
    border: none;
    outline: none;
    border-bottom: #62cbc5 1px solid;
}

.myinput:focus {
    border-bottom: none;
    outline: #70cbec solid 1.6px;
}

button {
    color: white;
    background: #39bcbc;
    border: none;
    width: 80%;
    height: 3em;
    border-radius: 5px;
}

button:hover {
    cursor: pointer;
}

button.disabled {
    background: grey;
}

#message {
    width: 100%;
    text-align: center;
}

#message.success {
    box-shadow: rgb(76 217 31 / 49%) 0px 0px 0px 1px;
    color: #88c988;
}

#message.error {
    box-shadow: rgb(223 12 12 / 43%) 0px 0px 0px 1px;
    color: #de3b3bf0;
}

.form_row>a.router-link-active {
    color: #a7e66e !important;
}

.form_row>a {
    color: #71c6ff;
    text-decoration: none;
}

.form_row>a:visited {
    color: #71c6ff;
    text-decoration: none;
}
</style>