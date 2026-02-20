const dbName = "BB_FORROS_SISTEMA_V2";
let db;

const initDB = () => {
    return new Promise((resolve) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (e) => {
            const conn = e.target.result;
            conn.createObjectStore("clientes", { keyPath: "id", autoIncrement: true });
            conn.createObjectStore("produtos", { keyPath: "id", autoIncrement: true });
            conn.createObjectStore("pedidos", { keyPath: "id", autoIncrement: true });
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(db); };
    });
};

const crud = {
    add: (store, data) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).add(data);
    },
    list: (store) => {
        return new Promise((resolve) => {
            const tx = db.transaction(store, "readonly");
            const req = tx.objectStore(store).getAll();
            req.onsuccess = () => resolve(req.result);
        });
    },
    update: (store, data) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(data);
    },
    del: (store, id) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).delete(id);
    }
};
initDB();