<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>IonicVideosApp - Alex</ion-title>
      <ion-buttons slot="end">
         <ion-button router-link="/home">Inicio</ion-button>
         <ion-button v-if="!isAuthenticated" router-link="/login">Login</ion-button>
         <ion-button v-if="!isAuthenticated" router-link="/register">Registro</ion-button>
         <ion-button v-if="isAuthenticated" router-link="/user">Mis Videos</ion-button>
         <ion-button v-if="isAuthenticated" @click="logout">Salir</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const token = ref(localStorage.getItem('token'));

const isAuthenticated = computed(() => !!token.value);

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    window.dispatchEvent(new Event('auth-change'));
    router.replace('/home');
}
onMounted(() => {
    window.addEventListener('auth-change', () => {
        token.value = localStorage.getItem('token');
    });
});
</script>
