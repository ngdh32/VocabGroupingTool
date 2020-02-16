// const self = this;
let queueProcessor = null;
let config = null;
let vgt_auth = null;

const VGTDBName = "VGT";
let QueueStore_Name = null;
let QueueStore_Id = null;


let _db = null;

class ResponseQueueObject {
    constructor(functionMethod, result) {
        this.functionMethod = functionMethod;
        this.result = result;
    }
}

// get indexed DB. If indexedDB is not initialized, initialize one and assign the newly created db 
const getQueueIndexedDB = () => {
    return new Promise(function (successCallback, errorCallback) {
        // check if database is intialized or not
        if (_db == null) {
            initQueueIndexedDB().then(() => {
                successCallback();
            }).catch(error => {
                console.timeLog("initQueueIndexedDB erros");
                console.log(error);
                errorCallback();
            });
        } else {
            successCallback();
        }
    });
}

const initQueueIndexedDB = () => {
    return new Promise(function (successCallback, errorCallback) {

        let request = indexedDB.open(VGTDBName, config.VGT_IndexedDB_Version);
        request.onupgradeneeded = function (event) {
            // Save the IDBDatabase interface 
            _db = event.target.result;

        };

        request.onsuccess = function (event) {
            _db = event.target.result;

            // initialize the queueProcessor only after the DB is ready
            if (queueProcessor == null) {
                SetupProcessRequestQueue();
            }
            console.log("Indexed DB is successfully created")
            successCallback();
        }

        request.onerror = function (event) {
            alert("Indexed DB cannot be established!")
            console.log(event)
            errorCallback();
        }
    })
}



// self.addEventListener("message", function (msg) {
onmessage = function(msg){
    if (msg.data.functionMethod === "init") {
        let initParameters = msg.data.parameters[0];
        config = initParameters.config;
        console.log(initParameters.vgt_auth)
        vgt_auth = initParameters.vgt_auth;
        QueueStore_Name = config.VGT_Queue_ObjectStore;
        QueueStore_Id = config.VGT_Queue_ObjectStore_Id;
        console.log("config setup done")
        console.log(config)

    } else {
        getQueueIndexedDB().then(() => {
            let requestObject = msg.data;
            let transaction = _db.transaction([QueueStore_Name], "readwrite");
            let objectStore = transaction.objectStore(QueueStore_Name);

            let request = objectStore.add(requestObject);

            request.onsuccess = function (event) {
                console.log("Request is successfully inserted");
            }

            request.onerror = function (error) {
                console.log("Request is unsuccessfully inserted");
            }

        }).catch(error => {
            console.log("Error occus when retrieving message from main thread");
            console.log(error)
        });
    }
}
// )

const VocabAPI = {
    // vocab related API function
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
                console.log(error)
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
                // self.postMessage(response);
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
    // always setup the queueProcessor for the next run
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


                if (requestObject == null) {
                    console.log("No request...")
                    successCallback();
                } else {
                    console.log("Request is retrieved from queue")
                    console.log(requestObject)
                    console.log(this)
                    console.log(Array.isArray(requestObject.parameters))
                    VocabAPI[requestObject.functionMethod](...requestObject.parameters).then(() => {
                        console.log("Request is done sccessfully");
                        // remove the object
                        let deleteTransaction = _db.transaction([QueueStore_Name], "readwrite");
                        let deleteQueueObjectStore = deleteTransaction.objectStore(QueueStore_Name);
                        deleteQueueObjectStore.delete(requestObject[config.VGT_Queue_ObjectStore_Id])
                        successCallback();
                    }).catch(error => {
                        console.log("Request is done unsccessfully");
                        // remove the object
                        let deleteTransaction = _db.transaction([QueueStore_Name], "readwrite");
                        let deleteQueueObjectStore = deleteTransaction.objectStore(QueueStore_Name);
                        deleteQueueObjectStore.delete(requestObject[config.VGT_Queue_ObjectStore_Id])
                        errorCallback();
                    });
                }
            };

            openCursor.onerror = function (error) {
                console.log("Request is unsuccessfully inserted");
                console.log(error)
                errorCallback();
            }

        });
    });
}

// const workercode = () => {
    

// }



// // create the temp javascript content and return the url of it
// let code = workercode.toString();
// console.log(code);
// code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
// const blob = new Blob([code], { type: "application/javascript" })
// const worker_script = URL.createObjectURL(blob)
// export default worker_script