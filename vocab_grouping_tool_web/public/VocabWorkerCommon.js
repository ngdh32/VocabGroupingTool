const VGTDBName = "VGT";

let config = null;
let vgt_auth = null;
let QueueStore_Name = null;
let QueueStore_Id = null;
let _db = null;

const initConfigValues = function(initParameters){
    config = initParameters.config;
    vgt_auth = initParameters.vgt_auth;
    QueueStore_Name = config.VGT_Queue_ObjectStore;
    QueueStore_Id = config.VGT_Queue_ObjectStore_Id;
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


// initialize the indexedDB
const initQueueIndexedDB = () => {
    return new Promise(function (successCallback, errorCallback) {

        let request = indexedDB.open(VGTDBName, config.VGT_IndexedDB_Version);
        request.onupgradeneeded = function (event) {
            // Save the IDBDatabase interface 
            _db = event.target.result;
        };

        request.onsuccess = function (event) {
            _db = event.target.result;

            console.log("Queue Indexed DB is successfully created")
            successCallback();
        }

        request.onerror = function (event) {
            alert("Indexed DB cannot be established!")
            console.log(event)
            errorCallback();
        }
    })
}



class ResponseQueueObject {
    constructor(functionMethod, result) {
        this.functionMethod = functionMethod;
        this.result = result;
    }
}