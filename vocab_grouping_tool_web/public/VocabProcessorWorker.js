// This worker is dedicated to handle the request in the queue

this.importScripts("/VocabWorkerCommon.js")


onmessage = function(msg){
    if (msg.data.functionMethod === "init") {
        let initParameters = msg.data.parameters[0];
        initConfigValues(initParameters);
        SetupProcessRequestQueue();
    } else {
        // no direct call from main thread
    }
}

const SetupProcessRequestQueue = () => {
    ProcessRequestQueue().then(() => {
        SetupProcessRequestQueue();
    }).catch(error => {
        SetupProcessRequestQueue();
    })
}



const ProcessRequestQueue = () => {
    return new Promise(function (successCallback, errorCallback) {
        getQueueIndexedDB().then(() => {
            let transaction = _db.transaction([QueueStore_Name], "readwrite");
            let objectStore = transaction.objectStore(QueueStore_Name);
            let openCursor = objectStore.openCursor();
            let requestObject = null;

            transaction.oncomplete = function(){
                if (requestObject != null){
                    console.log("New request is retrieved:" + requestObject[QueueStore_Id])
                    VocabAPI[requestObject.functionMethod](...requestObject.parameters).then(() => {
                        console.log("Request is done sccessfully");
                    }).catch(error => {
                        console.log("Request is done unsccessfully");
                    }).finally(() => {
                        console.log("ProcessRequestQueue Finally called")
                        let deleteTransaction = _db.transaction([QueueStore_Name], "readwrite");
                        let deleteQueueObjectStore = deleteTransaction.objectStore(QueueStore_Name);
                        let deleteRequest = deleteQueueObjectStore.delete(requestObject[config.VGT_Queue_ObjectStore_Id]);

                        deleteRequest.onsuccess = function(){
                            successCallback();
                        }

                        deleteRequest.onerror = function(){
                            errorCallback();
                        }
                    });
                }else{
                    //console.log("No request is handled")
                    successCallback();
                }
            }

            openCursor.onsuccess = function (event) {
                var cursor = event.target.result;
                // searching for the request object with the most minimum id
                if (cursor) {
                    if (requestObject == null) {
                        requestObject = cursor.value;
                    } else if (requestObject[QueueStore_Id] > cursor.value[QueueStore_Id]) {
                        requestObject = cursor.value;
                    }

                    cursor.continue();
                } 
            };

            openCursor.onerror = function (error) {
                console.log("The cursor failed to be opened");
                console.log(error)
                errorCallback();
            }

        });
    });
}

// Vocab related API functions
const VocabAPI = {
    // get vocablist from server
    GetVocabListFromServer: () => {
        return new Promise(function (successCallback, errorCallback) {
            const bearer = 'Bearer ' + vgt_auth;

            const requestConfigObject = {
                method: 'GET',
                headers: {
                    'Authorization': bearer
                }
            }

            // retrieve the last vocablist updated timestamp from indexedDB and send it to the server
            // to check if there is any update on the vocablist in the server
            let transaction = _db.transaction([config.VGT_VGT_Info_ObjectStore], "readwrite");
            let objectStore = transaction.objectStore(config.VGT_VGT_Info_ObjectStore);
            let request = objectStore.get(config.VocabsStore_lastVocabModifiedDate_Id);

            request.onsuccess = event => {
                let lastVocabUpdateDate = request.result == undefined ? "" : request.result.data; // if the timestamp cannot be retrieved, send empty string instead
                callApi("/api/vocabs/" + lastVocabUpdateDate, requestConfigObject
                    , (res) => {
                        // send the result back to main thread
                        const response = new ResponseQueueObject("GetVocabListFromServer", res);
                        // self.postMessage(response);
                        postMessage(response)
                        successCallback();
                    }, (error) => {
                        console.log("Error occurs when retriving vocabs from server...")
                        console.log(error)
                        errorCallback();
                    })
            }

            request.onerror = error => {
                console.log("Error occurs when retriving lastvocabupdatetime from indexedDB")
                console.log(error);
                errorCallback();
            }
        })
    }


};

const callApi = (url, options, callback, errorCallback) => {
    fetch(config.vgt_core_url + url, options)
        .then(function (response) {
            // token expired
            if (response.status == '401') {
                console.log("The cookie is expired");
                const response = new ResponseQueueObject("401", null);
                // return the 401 response to app so that it will log
                postMessage(response);
                errorCallback(); 
            }

            // deserialize the response into JSON object
            if (response.ok) {
                return response.json();
            }
        })
        .then(res => {
            console.log("Request sent successfully...")
            callback(res);
        }).catch(function (error) {
            console.log("Request sent unsuccessfully...")
            console.log(error);
            errorCallback();
        });
}


