export const aplicarConfiguracion = (config: any) => {

    document.body.classList.remove(
        'tema-default',
        'tema-claro',
        'tema-oscuro',
        'texto-normal',
        'texto-grande',
        'texto-muy-grande',
        'alto-contraste'
    );

    if (config.tema === 'sistema') {
        document.body.classList.add('tema-default');
    }

    if (config.tema === 'claro') {
        document.body.classList.add('tema-claro');
    }

    if (config.tema === 'oscuro') {
        document.body.classList.add('tema-oscuro');
    }

    document.body.classList.add(
        `texto-${config.tamano_letra || 'normal'}`
    );

    if (config.alto_contraste) {
        document.body.classList.add('alto-contraste');
    }
};

export const cargarConfiguracion = async () => {

    const token = localStorage.getItem('token');

    if (!token) return;

    try {

        const res = await fetch(
            'http://192.168.1.80:3000/config',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const config = await res.json();

        aplicarConfiguracion(config);

    } catch (error) {

        console.error(error);

    }
};