import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useJWTStore = defineStore('JWT', () => {
  const JWT = ref("");
  
  return { JWT };
})
