<template>
  <ion-page>
    <Navbar />
    <ion-content class="ion-padding">
      <h1 class="ion-text-center">Mis Archivos</h1>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Subir Nuevo Archivo</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Título</ion-label>
            <ion-input v-model="newVideo.title" type="text"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Descripción</ion-label>
            <ion-input v-model="newVideo.description" type="text"></ion-input>
          </ion-item>
          
          <div class="ion-margin-top">
             <file-pond
               ref="pond"
               name="file"
               label-idle="Arrastra y suelta tu video aquí o <span class='filepond--label-action'>Explora</span>"
               accepted-file-types="video/*, image/*"
               :allow-multiple="false"
               :server="{
                 process: handleProcess,
                 revert: null,
                 load: null,
                 restore: null,
                 fetch: null
               }"
             />
          </div>
        </ion-card-content>
      </ion-card>

      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="4" v-for="video in userVideos" :key="video.id">
            <ion-card>
              <ion-card-header>
                <ion-card-title>{{ video.title }}</ion-card-title>
                <ion-card-subtitle>{{ video.description }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <video v-if="video.url" :src="'http://localhost:8000/storage/' + video.url" controls style="width: 100%"></video>
                <div class="ion-margin-top">
                  <ion-button color="danger" @click="deleteVideo(video.id)">Eliminar</ion-button>
                </div>
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
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import api from '@/api';

// FilePond imports
import vueFilePond from 'vue-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
const FilePond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const userVideos = ref<any[]>([]);
const pond = ref<any>(null);

const newVideo = ref({
  title: '',
  description: ''
});

const loadVideos = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await api.get('/multimedia');
    // Assuming the API returns all and we filter by user id, or API returns only user's if we hit a specific endpoint.
    // We'll filter visually if user ID matches, or just show all if API already filters.
    if(user && user.id) {
       userVideos.value = response.data.filter((v: any) => v.user_id === user.id);
    } else {
       userVideos.value = response.data; // fallback
    }
  } catch (error) {
    console.error("Error loading videos:", error);
  }
};

const handleProcess = (fieldName: string, file: File, metadata: any, load: (p: string | { [key: string]: any }) => void, error: (errorText: string) => void, progress: (computable: boolean, loaded: number, total: number) => void, abort: () => void) => {
    
    if(!newVideo.value.title) {
        error("Ponle un título primero.");
        return { abort };
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('title', newVideo.value.title);
    formData.append('description', newVideo.value.description);
    
    const request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:8000/api/multimedia');
    
    // Set Auth Header
    const token = localStorage.getItem('token');
    if (token) {
        request.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    request.upload.onprogress = (e) => {
        progress(e.lengthComputable, e.loaded, e.total);
    };

    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            load(request.responseText);
            newVideo.value.title = '';
            newVideo.value.description = '';
            if(pond.value) {
                pond.value.removeFiles();
            }
            loadVideos();
        } else {
            error('oh no');
        }
    };

    request.onerror = function() {
        error('oh no');
    };

    request.send(formData);

    return {
        abort: () => {
            request.abort();
            abort();
        }
    };
};

const deleteVideo = async (id: number) => {
  if(confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      try {
        await api.delete(`/multimedia/${id}`);
        loadVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
      }
  }
};

onMounted(() => {
  loadVideos();
});
</script>
