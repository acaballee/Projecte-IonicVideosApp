<template>
  <ion-page>
    <Navbar />
    <ion-content class="ion-padding">
      <ion-card style="max-width: 400px; margin: 0 auto">
        <ion-card-header>
          <ion-card-title>Login</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input v-model="password" type="password"></ion-input>
          </ion-item>
          <ion-button expand="block" class="ion-margin-top" @click="login">Entrar</ion-button>
          <div class="ion-text-center ion-margin-top">
             <p v-if="error" style="color: red">{{ error }}</p>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
    <Footer />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import api from '@/api';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
    try {
        const res = await api.post('/login', { email: email.value, password: password.value });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            if (res.data.user) {
                 localStorage.setItem('user', JSON.stringify(res.data.user));
            }
            window.dispatchEvent(new Event('auth-change'));
            router.replace('/user');
        }
    } catch (err) {
        error.value = "Credenciales incorrectas";
    }
};
</script>
