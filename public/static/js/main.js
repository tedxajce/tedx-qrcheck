let db;
let type;

document.addEventListener("DOMContentLoaded", function () {
    try {
        let app = firebase.app();
        let features = [
            "auth",
            "database",
            "firestore",
            "functions",
            "messaging",
            "storage",
            "analytics",
            "remoteConfig",
            "performance",
        ].filter((feature) => typeof app[feature] === "function");

        db = firebase.firestore();
    } catch (e) {
        console.error(e);
    }
});