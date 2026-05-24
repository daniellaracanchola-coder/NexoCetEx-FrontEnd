<template>
    <ion-page>
        <ion-header>
            <AppPageHeader
                title="Registro de nuevo usuario"
                :show-menu="false"
                :show-logo="false"
                :show-brand="false"
                back-href="/login"
            />
        </ion-header>
        
        <ion-content class="ion-padding login-bg">
            <p class="page-intro regist-info">
                Cuando envíes el registro, un administrador debe <strong>aprobar tu cuenta</strong>
                antes de que puedas iniciar sesión. Guarda tu usuario y contraseña para después.
            </p>

            <ion-input
                v-model="username"
                label="Usuario"
                placeholder="Ingresa tu usuario"
                label-placement="floating"
                fill="outline">
            </ion-input>

            <ion-input
                v-model="password"
                type="password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                label-placement="floating"
                fill="outline"
                class="input-space">
            </ion-input>

            <ion-select
                v-model="rol"
                label="Rol"
                label-placement="floating"
                fill="outline"
                class="input-space">

                <ion-select-option value="alumno">
                    Alumno
                </ion-select-option>

                <ion-select-option value="profesor">
                    Profesor
                </ion-select-option>
            </ion-select>

            <div v-if="rol === 'alumno'">
                <ion-select
                    v-model="grado"
                    label="Grado"
                    label-placement="floating"
                    fill="outline"
                    class="input-space">
                    
                    <ion-select-option value="1">1</ion-select-option>
                    <ion-select-option value="2">2</ion-select-option>
                    <ion-select-option value="3">3</ion-select-option>
                    <ion-select-option value="4">4</ion-select-option>
                    <ion-select-option value="5">5</ion-select-option>
                    <ion-select-option value="6">6</ion-select-option>
                    <ion-select-option value="7">7</ion-select-option>
                    <ion-select-option value="8">8</ion-select-option>
                </ion-select>

                <ion-select
                    v-model="grupo"
                    label="Grupo"
                    label-placement="floating"
                    fill="outline"
                    class="input-space">

                    <ion-select-option value="A">A</ion-select-option>
                    <ion-select-option value="B">B</ion-select-option>
                    <ion-select-option value="C">C</ion-select-option>
                    <ion-select-option value="D">D</ion-select-option>
                    <ion-select-option value="E">E</ion-select-option>
                    <ion-select-option value="S">S</ion-select-option>
                </ion-select>
            </div>

            <div class="form-actions">
              <ion-button @click="registrar">Crear cuenta</ion-button>
            </div>

            <p v-if="mensaje" class="mensaje">
                {{ mensaje }}
            </p>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
    import{
        IonPage,
        IonHeader,
        IonContent,
        IonInput,
        IonButton,
        IonSelect,
        IonSelectOption,
    } from '@ionic/vue';

    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { mostrarRegistroEnviado, mostrarToast } from '@/services/feedback';
    import AppPageHeader from '@/components/AppPageHeader.vue';

    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const rol = ref('');
    const grado = ref('');
    const grupo = ref('');
    const mensaje = ref('');
    
    const registrar = async () => {
        if (!username.value || !password.value || !rol.value) {
            mensaje.value = 'Completa usuario, contraseña y rol';
            return;
        }

        if (rol.value === 'alumno' && (!grado.value || !grupo.value)) {
            mensaje.value = 'Grado y grupo son obligatorios para alumnos';
            return;
        }

        const gradoEnviar = rol.value === 'alumno' ? grado.value : null;
        const grupoEnviar = rol.value === 'alumno' ? grupo.value : null;

        try {
            const res = await fetch(
                'https://backend-nexo.onrender.com/auth/registro',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username.value,
                        password: password.value,
                        rol: rol.value,
                        grado: gradoEnviar,
                        grupo: grupoEnviar
                    })
                }
            );
            const data = await res.json();

            mensaje.value = data.mensaje;

            if (res.ok) {
                mensaje.value = '';
                await mostrarRegistroEnviado(router, data.mensaje);
            } else {
                await mostrarToast(data.mensaje || 'No se pudo completar el registro', 'danger');
            }
        } catch (error) {
            console.error(error);
            mensaje.value = 'Error al conectar con el servidor';
            void mostrarToast('Error al conectar con el servidor', 'danger');
        }
    };

</script>

<style scoped>
    .input-space {
        margin-top: 16px;
    }

    .mensaje {
        text-align: center;
        color: var(--ion-color-danger);
    }

    .regist-info {
        margin-bottom: 8px;
    }
</style>