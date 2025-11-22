import axios, { AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { cookies } from "next/headers";

const instance = axios.create({
    // ADICIONE ISSO AQUI!
    // Isso diz ao axios para enviar e receber cookies em requisições cross-origin.
    withCredentials: true 
});

const authUrl = process.env.AUTH_SERVER;

instance.interceptors.request.use(
    async (config) => {
        const cookieStore = await cookies();
        const cookie_token = cookieStore.get("token")
        const cookie_refresh = cookieStore.get("refresh")
        if(cookie_token != null) {
            console.log("cookie token não é null")
            config.headers.Authorization = `Bearer ${cookie_token.value}`
        }else if(cookie_refresh != null) {
            console.log("Token expirado, tentando refresh via refresh token")
            instance.post(`${authUrl}/api/refresh/`, {refresh: cookie_refresh.value})
            .then((res) => {
                cookieStore.set("token", res.data.token);
            })
        }
        console.log(config);
        return config;
    }
)

instance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response){

            let response: AxiosResponse = error.response;

            console.log(response)

            if(response.status == 403 && response.config.headers.get('retry')){
                instance.request({
                    url: `${process.env.NEXT_PUBLIC_AUTHSERVER}/api/token/refresh`,

                });

                return instance.request({
                    ...response.config,
                });
            }
        }

        return Promise.reject(error)
    }
)

export default instance