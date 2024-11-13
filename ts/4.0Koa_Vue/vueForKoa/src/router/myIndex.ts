import { createRouter, createWebHistory } from 'vue-router'
import login from "../views/login.vue"
import index from "../views/index.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path:"/login",
        name:"login",
        component : login,
    },
    {
      path:"/register",
      name:"register",
      component: login,
    },
    {
      path:"/",
      name:"index",
      component: index,
    },
    {
      path:"/change_passwd",
      name:"change_passwd",
      component: login,
    },
  ],
})

export default router
