var auth;

// Listen for auth state changes
document.addEventListener("DOMContentLoaded", function () {
    try {
        auth = firebase.auth();
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // User is signed in, proceed to retrieve data
                console.log("Logged in successfully!");
            } else {
                // User is not signed in, redirect to login page
                window.location.replace("/login.html"); // Replace with your login page URL
            }
        });
        // Firebase Firestore
        var db = firebase.firestore();

        // Fetch all registration details
        var registrationsRef = db.collection("registrations");

        registrationsRef.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var registrationData = doc.data();
                displayRegistrationDetails(doc.id, registrationData);
            });
        });

        fetchAllAttendedUserData();

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
                        markAttendance(registrationNumber);
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

// Function to display registration details in the table
function displayRegistrationDetails(registrationNo, data) {
    var tableBody = document.getElementById("registrationTableBody");

    var row = document.createElement("tr");

    row.id = `row_${registrationNo}`;
    if (data.attendance) {
        row.innerHTML = `
            <td>${registrationNo}</td>
            <td>${data.name}</td>
            <td>✅</td>
            <td><button class="btn btn-danger" onclick="deleteEntry('${registrationNo}')"><i class="fa fa-times"></i></button></td>
        `;
    } else {
        row.innerHTML = `
            <td>${registrationNo}</td>
            <td>${data.name}</td>
            <td><button class="btn btn-success" onclick="markAttendance('${registrationNo}')">Mark Attendance</button></td>
            <td><button class="btn btn-danger" onclick="deleteEntry('${registrationNo}')"><i class="fa fa-times"></i></button></td>
        `;
    }

    tableBody.appendChild(row);
}

function displayAttendedUserData(data) {
    var tableBody = document.getElementById("attendedTableBody");

    var row = document.createElement("tr");

    row.id = `row_${registrationNo}`;
    row.innerHTML = `
    <td>${registrationNo}</td>
    <td>${data.name}</td>
`;

    tableBody.appendChild(row);
}

function fetchAllAttendedUserData() {
    try {
        var db = firebase.firestore();
        var registrationsRef = db
            .collection("registrations")
            .where("attendance", "==", true);

        registrationsRef.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var registrationData = doc.data();
                displayAttendedUserData(registrationData);
            });
        });
    } catch (e) {
        console.error("Error fetching user data", e);
    }
}

function markAttendance(registrationNumber) {
    try {
        var db = firebase.firestore();
        db.collection("registrations")
            .doc(`${registrationNumber}`)
            .set({ attendance: true }, { merge: true })
            .then(() => {
                alert("Attendance marked successfully");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });

        // Fetch user data
        fetchAllAttendedUserData();
    } catch (e) {
        console.error(`Error marking attendance for ${registrationNumber}`, e);
    }
}

// Function to delete a registration entry
function deleteEntry(registrationNo) {
    var db = firebase.firestore();
    db.collection("registrations")
        .doc(`${registrationNo}`)
        .delete()
        .then(function () {
            console.log("Document successfully removed!");
            document.getElementById(`row_${registrationNo}`).remove();
        })
        .catch(function (error) {
            console.error("Error removing document: ", error);
        });
}

// Logout function
function logout() {
    auth.signOut()
        .then(function () {
            // Redirect or perform actions after successful logout
            console.log("Logout successful");
            window.location.replace("/login.html"); // Replace with the login page URL
        })
        .catch(function (error) {
            // Handle logout errors
            console.error("Logout failed", error);
            alert("Logout failed. Please try again.");
        });
}
