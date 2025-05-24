import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: 'JSON转JS',
        description: '使用JS处理JSON',
        icon: 'mdi-home',
        category: '处理工具'
      }
    },
    {
      path: '/html',
      name: 'Html',
      component: () => import('../views/htmlToJs/index.vue'),
      meta: {
        title: 'HTML转JS',
        description: '使用JS处理HTML',
        icon: 'mdi-code-tags',
        category: '处理工具'
      }
    },
  ],
})

export default router
