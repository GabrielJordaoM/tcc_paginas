import axios, { AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios"

const instance = axios.create();

//Creating a request interceptor


instance.interceptors.request.use(
    (config) => {
        if(!config.headers.has('retry')){
            config.headers.set('retry', true)
        }

        return config
    }
)

//Creating a response interceptor

instance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response){
            let response: AxiosResponse = error.response;

            if(response.status == 403 && response.config.headers.get('retry')){
                instance.request({
                    url: `${process.env.AUTHSERVER}/refresh/`,
                    headers:{
                        'retry': false
                    }
                });

                return instance.request({
                    ...response.config,
                    headers:{
                        'retry': false
                    }
                });
            }
        }

        return Promise.reject(error)
    }
)