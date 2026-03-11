<template>
  <ion-page>
    <Navbar />
    <ion-content class="ion-padding">
      <h1 class="ion-text-center">Todos los videos</h1>
      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="4" v-for="video in videos" :key="video.id">
            <ion-card>
              <ion-card-header>
                <ion-card-title>{{ video.title }}</ion-card-title>
                <ion-card-subtitle>{{ video.description }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <video v-if="video.url" :src="'http://localhost:8000/storage/' + video.url" controls style="width: 100%"></video>
                <p>Publicado por: {{ video.user?.name || 'Desconocido' }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <Footer />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import api from '@/api';

const videos = ref<any[]>([]);

const loadVideos = async () => {
  try {
    const response = await api.get('/multimedia');
    videos.value = response.data;
  } catch (error) {
    console.error("Error loading videos:", error);
  }
};

onMounted(() => {
  loadVideos();
});
</script>
