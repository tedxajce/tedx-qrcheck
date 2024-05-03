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

        function domReady(fn) {
            if (
                document.readyState === "complete" ||
                document.readyState === "interactive"
            ) {
                setTimeout(fn, 1000);
            } else {
                document.addEventListener("DOMContentLoaded", fn);
            }
        }

        domReady(function () {
            // If found you qr code
            function onScanSuccess(decodeText, decodeResult) {
                var result = JSON.parse(decodeText);
                result.forEach((data) => {
                    const registrationNumber = data.registrationNumber;
                    if (registrationNumber) {
                        getUserData(registrationNumber);
                    }
                });
            }

            let htmlscanner = new Html5QrcodeScanner("qr-reader", {
                fps: 10,
                qrbos: 250,
            });
            htmlscanner.render(onScanSuccess);
        });
    } catch (e) {
        console.error(e);
    }
});


function getUserData(id) {
    try {
        var registrationsRef = db.collection("registrations").doc(id);

        registrationsRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const heroSection = document.getElementById("hero-section");

                    heroSection.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${data.name}</h5>
                                <p class="card-text">${data.registrationNumber}</p>
                            </div>
                        </div>
                    `;
                } else {
                    console.log("No such document!");
                }
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
    } catch (e) {
        console.error(e);
    }
}