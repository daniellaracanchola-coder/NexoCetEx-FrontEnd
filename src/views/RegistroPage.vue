<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    Registro de nuevo usuario
                </ion-title>
            </ion-toolbar>
        </ion-header>
        
        <ion-content class="ion-padding">

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

            <ion-button
                expand="block"
                class="input-space"
                @click="registrar">
                Crear cuenta
            </ion-button>

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
        IonToolbar,
        IonTitle,
        IonContent,
        IonInput,
        IonButton,
        IonSelect,
        IonSelectOption
    } from '@ionic/vue';

    import { ref } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const rol = ref('');
    const grado = ref('');
    const grupo = ref('');
    const mensaje = ref('');
    
    const registrar = async () => {
        try {
            const res = await fetch(
                'http://192.168.1.80:3000/auth/registro',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username.value,
                        password: password.value,
                        rol: rol.value,
                        grado: grado.value,
                        grupo: grupo.value
                    })
                }
            );
            const data = await res.json();

            mensaje.value = data.mensaje;

            if (res.ok) {
                router.push('/');
            }
        } catch (error) {
            console.error(error);
            mensaje.value=
                'Error al conectar con el servidor';
        }
    };

</script>

<style scoped>
    .input-space {
        margin-top: 16px;
    }

    .mensaje {
        text-align: center;
        color: red;
    }
</style>