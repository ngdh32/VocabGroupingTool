// This worker is dedicated to handle the request sending from the main thread(application)

this.importScripts("/VocabWorkerCommon.js")

onmessage = function(msg){
    if (msg.data.functionMethod === "init") {
        let initParameters = msg.data.parameters[0];
        initConfigValues(initParameters)

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