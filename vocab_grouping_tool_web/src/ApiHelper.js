import config from './Config.js';

export default class ApiHelper {
     static callApi(url, options, handleRemoveAuthCookie, callback, errorCallback) {
        fetch(config.vgt_core_url + url, options)
            .then(function (response) {
                // token expired
                if (response.status == '401') {
                    handleRemoveAuthCookie();
                }

                // deserialize the response into JSON object
                if (response.ok) {
                    return response.json();
                }  
            })
            .then(res => {
                callback(res);
            }).catch(function (error) {
                console.log(error);
                errorCallback(error);
            });
    }
}