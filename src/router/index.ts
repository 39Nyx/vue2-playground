import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'PlayGround',
      component: () => import('../views/playground/PlayGround.vue'),
    }
  ],
})

export default router
