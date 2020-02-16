import config from './Config.js';

const web_worker_url = "/VocabQueueWorker.js";

export default class VocabAPI {
    constructor(vocabContext) {
        this.vocabContext = vocabContext;
        this.vocabQueueWorker = new Worker(web_worker_url);
        this.vocabQueueWorker.onmessage = this.processResultFromVocabQueueWorker;

        // passs the config parameter
        const initParameter = {
            config: config,
            vgt_auth: vocabContext.props.vgt_auth
        }
        const initializeRequest = new RequestQueueObject("init", initParameter);
        this.vocabQueueWorker.postMessage(initializeRequest);
        // this.initVocabsIndexedDB();
    }

    VGTDBName = "VGT";
    VocabsStore_Name = config.VGT_VGT_Info_ObjectStore;
    VocabsStore_Id = config.VGT_VGT_Info_ObjectStore_Id;
    VocabsStore_Vocabs_Id = config.VocabsStore_Vocabs_Id; // key:0 actually stores the whole vocablist instead of a single vocab 
    VocabsStore_lastVocabModifiedDate_Id = config.VocabsStore_lastVocabModifiedDate_Id; // key:1 stores the last Vocab modified date
    // indexedDBFirstTimeAccess = false;

    _db = null;


    processResultFromVocabQueueWorker = (msg) => {
        const responseObject = msg.data;
        // if 401/403 then logout
        if (responseObject.functionMethod == 403 || responseObject.functionMethod == 401) {
            this.vocabContext.handleRemoveAuthCookie();
        } else {
            this[responseObject.functionMethod](responseObject.result);
        }

    }

    // get indexed DB. If indexedDB is not initialized, initialize one and assign the newly created db 
    getVocabIndexedDBReady = () => {
        let _this = this;
        return new Promise(function (successCallback, errorCallback) {
            if (_this._db == null) {
                _this.initVocabsIndexedDB().then(() => {
                    successCallback();
                });
            } else {
                successCallback();
            }
        });
    }

    initVocabsIndexedDB = () => {
        let _this = this;
        return new Promise(function (successCallback, errorCallback) {
            let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            let request = indexedDB.open(_this.VGTDBName, config.VGT_IndexedDB_Version);
            request.onupgradeneeded = function (event) {
                // Save the IDBDatabase interface 
                _this._db = event.target.result;

                // Create the vocablist bjectStore for this database
                _this._db.createObjectStore(config.VGT_VGT_Info_ObjectStore, { keyPath: config.VGT_VGT_Info_ObjectStore_Id });

                // Create the queue objectstore for this database
                _this._db.createObjectStore(config.VGT_Queue_ObjectStore, { keyPath: config.VGT_Queue_ObjectStore_Id, autoIncrement: true });

                // _this.indexedDBFirstTimeAccess = true;
            };

            request.onsuccess = function (event) {
                _this._db = event.target.result;
                console.log("Indexed DB is successfully created")
                successCallback();
            }

            request.onerror = function (event) {
                alert("Indexed DB cannot be established!")
                console.log(event)
            }
        })
    }

    // the top level of getting vocab list
    GetVocabListAPI = () => {
        let _this = this;
        // show loading spin
        _this.vocabContext.setState({
            isVocabLoading: true
        })
        // get vocabs list from indexedDB
        _this.GetVocabListFromIndexedDB().then((res) => {
            // check whether the indxedDB is first time access
            // console.log("indexedDBFirstTimeAccess:" + _this.indexedDBFirstTimeAccess)
            if (res != undefined) {
                // only load vocablist if entry can be returned
                const vocabs = res.data;
                _this.vocabContext.setState({ vocabs: vocabs, displayVocabs: vocabs, searchKey: "" });
                _this.vocabContext.setState({
                    isVocabLoading: false
                })
            }
        }).then(() => {
            // send getVocabList request to queue
            const getRequest = new RequestQueueObject("GetVocabListFromServer", "GetVocabListFromServer");
            _this.vocabQueueWorker.postMessage(getRequest);
        });
    }

    // get vocablist from indexedDB
    GetVocabListFromIndexedDB = () => {
        let _this = this;
        return new Promise(function (successCallback, errorCallback) {
            _this.getVocabIndexedDBReady().then(() => {
                console.log("Retriving the vocabs from indexedDB")
                let transaction = _this._db.transaction([config.VGT_VGT_Info_ObjectStore], "readwrite");
                let objectStore = transaction.objectStore(config.VGT_VGT_Info_ObjectStore);
                let request = objectStore.get(config.VocabsStore_Vocabs_Id);

                request.onsuccess = function (event) {
                    console.log("VGT vocabs retrieved from indexed DB")
                    console.log(request);
                    console.log(request.result);
                    successCallback(request.result);
                };

                request.onerror = function (event) {
                    console.log("VGT vocabs")
                    console.log(event)
                }

            });
        });
        // return {"code":200,"message":"","data":{"vocabs":[{"id":1,"word":"test","meaning":"test","example":"test","parentId":null,"userId":"5a349e36-6f7f-48ca-932f-9bf0bb67e73f","subVocabs":[]},{"id":2,"word":"a","meaning":"a","example":"a","parentId":null,"userId":"5a349e36-6f7f-48ca-932f-9bf0bb67e73f","subVocabs":[]}],"lastVocabUpdateDate":"2019-11-27T13:52:49.95584"}}
    }

    // get vocablist from server
    GetVocabListFromServer = (res) => {
        let _this = this;
        console.log("GetVocabListFromServer called");
        let transaction = _this._db.transaction([config.VGT_VGT_Info_ObjectStore], "readwrite");
        let objectStore = transaction.objectStore(config.VGT_VGT_Info_ObjectStore);
        let request = objectStore.get(config.VocabsStore_lastVocabModifiedDate_Id);

        request.onsuccess = event => {
            // check if the date can be retrived or not
            let lastVocabUpdateDate = request.result == undefined ? null : request.result.data;
            console.log(res)
            if (res.data.lastVocabUpdateDate == lastVocabUpdateDate) {
                console.log("Vocablist are synced with Server")
            } else {
                console.log("VocabList is updated in Server. Syncing with the server")
                _this.vocabContext.setState({
                    vocabs: res.data.vocabs,
                    displayVocabs: res.data.vocabs,
                    searchKey: "",
                    isVocabLoading: false
                })
                const vocabList = {};
                vocabList[config.VGT_VGT_Info_ObjectStore_Id] = config.VocabsStore_Vocabs_Id;
                vocabList["data"] = res.data.vocabs;
                let vocabListRequest = objectStore.put(vocabList);
                vocabListRequest.onsuccess = () => {
                    console.log("VocabList in IndexedDB updated successfully")
                    const lastVocabUpdateDateObject = {};
                    lastVocabUpdateDateObject[config.VGT_VGT_Info_ObjectStore_Id] = config.VocabsStore_lastVocabModifiedDate_Id;
                    lastVocabUpdateDateObject["data"] = res.data.lastVocabUpdateDate;
                    let lastVocabUpdateDateRequest = objectStore.put(lastVocabUpdateDateObject);
                    lastVocabUpdateDateRequest.onsuccess = () => {
                        console.log("lastVocabUpdateDate in IndexedDB updated successfully")
                    }

                    lastVocabUpdateDateRequest.onerror = () => {
                        console.log("lastVocabUpdateDate in IndexedDB updated successfully")
                    }
                }

                vocabListRequest.onerror = (err) => {
                    console.log("Error occurs when VocabList in IndexedDB updated ")

                }

            }
        }

        request.onerror = err => {
            console.log("Error occurs when retriving lastvocabupdatedate")
            console.log(err)
        }

    }

    // the top level of creating vocab list
    CreateVocab = () => {

    }

    // create vocab to indexedDB
    CreateVocabToIndexedDB = () => {

    }

    // create vocab to server
    CreateVocabToServer = () => {

    }


    // the top level of updating vocab list
    UpdateVocab = () => {

    }

    // update vocab to indexedDB
    UpdateVocabToIndexedDB = () => {

    }

    // update vocab to server
    UpdateVocabToServer = () => {

    }


    // the top level of deleting vocab list
    DeleteVocab = () => {

    }

    // delete vocab to indexedDB
    DeleteVocabToIndexedDB = () => {

    }

    // delete vocab to server
    DeleteVocabToServer = () => {

    }

    RemoveAllIndexedDBEntries() {
        const _this = this;
        return new Promise(function (successCallback, errorCallback) {
            _this.getVocabIndexedDBReady().then(() => {
                _this.vocabQueueWorker.terminate();
                let transaction = _this._db.transaction([config.VGT_VGT_Info_ObjectStore, config.VGT_Queue_ObjectStore], "readwrite");
                let VocabObjectStore = transaction.objectStore(config.VGT_VGT_Info_ObjectStore);
                let VocabObjectStoreClear = VocabObjectStore.clear();
                VocabObjectStoreClear.onsuccess = () => {
                    console.log("Successfullu clearing vocab objectstore")
                    let QueueObjectStore = transaction.objectStore(config.VGT_Queue_ObjectStore);
                    let QueueObjectStoreClear = QueueObjectStore.clear();
                    QueueObjectStoreClear.onsuccess = () => {
                        console.log("Successfullu clearing queue objectstore")
                        successCallback();
                    }

                    QueueObjectStoreClear.onerror = () => {
                        console.log("Error occurs when clearing queue objectstore")
                        successCallback();
                    }
                }

                VocabObjectStoreClear.onerror = () => {
                    console.log("Error occurs when clearing vocab objectstore")
                    successCallback();
                }
            });

        })

    }



}


class RequestQueueObject {
    constructor(functionMethod, ...parameters) {
        this.functionMethod = functionMethod;
        this.parameters = parameters;
    }
}
