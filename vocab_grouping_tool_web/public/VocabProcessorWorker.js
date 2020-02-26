// This worker is dedicated to handle the request in the queue

this.importScripts("/VocabWorkerCommon.js")


onmessage = function(msg){
    if (msg.data.functionMethod === "init") {
        let initParameters = msg.data.parameters[0];
        initConfigValues(initParameters)
    } else {
        
    }
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

            let transaction = _db.transaction([config.VGT_VGT_Info_ObjectStore], "readwrite");
            let objectStore = transaction.objectStore(config.VGT_VGT_Info_ObjectStore);
            let request = objectStore.get(config.VocabsStore_lastVocabModifiedDate_Id);

            request.onsuccess = event => {
                // retrieve vocab list
                let lastVocabUpdateDate = request.result == undefined ? "" : request.result.data;
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

const SetupProcessRequestQueue = () => {
    // always setup the queueProcessor for the next run no matter successful or failure call
    ProcessRequestQueue().then(() => {
        queueProcessor = setTimeout(SetupProcessRequestQueue, config.queueProcessorTimeInterval);
    }).catch(error => {
        queueProcessor = setTimeout(SetupProcessRequestQueue, config.queueProcessorTimeInterval);
    })
}

const ProcessRequestQueue = () => {
    // let _self = self;
    return new Promise(function (successCallback, errorCallback) {
        getQueueIndexedDB().then(() => {
            let transaction = _db.transaction([QueueStore_Name], "readwrite");
            let objectStore = transaction.objectStore(QueueStore_Name);
            let openCursor = objectStore.openCursor();

            openCursor.onsuccess = function (event) {
                let requestObject = null;
                var cursor = event.target.result;
                if (cursor) {
                    if (requestObject == null) {
                        requestObject = cursor.value;
                    } else if (requestObject[QueueStore_Id] > cursor.value[QueueStore_Id]) {
                        requestObject = cursor.value;
                    }

                    cursor.continue();
                } else {
                    console.log('Queue cursor is done');
                }

                let isRequestFromQueue = true;
                if (requestObject == null) {
                    console.log("No request...")
                    // if no request, send a get request to server to keep checking whether the vocablist in server is updated
                    requestObject = {
                        functionMethod : "GetVocabListFromServer",
                        parameters: []
                    }
                    isRequestFromQueue = false
                } 
                
                VocabAPI[requestObject.functionMethod](...requestObject.parameters).then(() => {
                    console.log("Request is done sccessfully");
                    // remove the object if the request is from queue
                    if (isRequestFromQueue){
                        let deleteTransaction = _db.transaction([QueueStore_Name], "readwrite");
                        let deleteQueueObjectStore = deleteTransaction.objectStore(QueueStore_Name);
                        deleteQueueObjectStore.delete(requestObject[config.VGT_Queue_ObjectStore_Id])
                    }
                    successCallback();
                }).catch(error => {
                    console.log("Request is done unsccessfully");
                    // remove the object if the request is from queue
                    if (isRequestFromQueue){
                        let deleteTransaction = _db.transaction([QueueStore_Name], "readwrite");
                        let deleteQueueObjectStore = deleteTransaction.objectStore(QueueStore_Name);
                        deleteQueueObjectStore.delete(requestObject[config.VGT_Queue_ObjectStore_Id])
                    }
                    errorCallback();
                });
                
            };

            openCursor.onerror = function (error) {
                console.log("Request is unsuccessfully inserted");
                console.log(error)
                errorCallback();
            }

        });
    });
}