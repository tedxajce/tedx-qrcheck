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
                console.log(decodeText, decodeResult);
                var result = JSON.parse(decodeText);
                var registrationNumber = result.registrationNumber;
                console.log(registrationNumber);
                if (registrationNumber) {
                    document.getElementById('modal-close-button').click();
                    markAttendance(registrationNumber);
                }
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

document.getElementById('csvFile').addEventListener('change', function(evt) {
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        var lines = contents.split('\n'); // split file into lines
        var tableBody = document.getElementById('csvTableBody');
        tableBody.innerHTML = ''; // clear table body

        // iterate over lines, skip the header
        for (var i = 1; i < lines.length; i++) {
            var row = document.createElement('tr');
            var cols = lines[i].split(','); // split line into columns

            // create a cell for each column
            for (var j = 0; j < cols.length; j++) {
                var cell = document.createElement('td');
                cell.textContent = cols[j];
                row.appendChild(cell);
            }

            tableBody.appendChild(row);
        }
    };
    reader.readAsText(file);
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
            <td>Attendance Marked</td>
            <td><button class="btn btn-danger" disabled onclick="deleteEntry('${registrationNo}')"><i class="fa fa-times"></i></button></td>
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

    row.id = `row_${data.id}`;
    row.innerHTML = `
    <td>${data.id}</td>
    <td>${data.name}</td>
    <td>${data.lunch ? "✅" : "❌"}</td>
    <td>${data.swags ? "✅" : "❌"}</td>
`;

    tableBody.appendChild(row);
}

function fetchAllAttendedUserData() {
    try {
        var db = firebase.firestore();
        var registrationsRef = db
            .collection("registrations")
            .where("attendance", "==", true);

        var tableBody = document.getElementById("attendedTableBody");
        tableBody.innerHTML = "";

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
            .get()
            .then((doc) => {
                if (!doc.exists) {
                    alert("Invalid registration number");
                    return;
                }
                if (doc.data().attendance) {
                    if (!doc.data().lunch) {
                        // Ask if the user wants to mark lunch
                        if (confirm("Attendance already marked. Do you want to mark lunch?")) {
                            markLunch(registrationNumber);
                        }
                    } else if (!doc.data().swags) {
                        // Ask if the user wants to mark swags
                        if (confirm("Lunch already marked. Do you want to mark swags?")) {
                            markSwags(registrationNumber);
                        }
                    } else {
                        alert("User has already availed all benefits!");
                    }
                } else {
                    db.collection("registrations")
                        .doc(`${registrationNumber}`)
                        .set({ attendance: true }, { merge: true })
                        .then(() => {
                            alert("Attendance marked successfully");
                            fetchAllAttendedUserData();
                        })
                        .then(() => {
                            // Set the attendance status in the table
                            var row = document.getElementById(
                                `row_${registrationNumber}`
                            );
                            row.innerHTML = `
                                <td>${registrationNumber}</td>
                                <td>${row.cells[1].innerText}</td>
                                <td>Attendance Marked</td>
                                <td><button class="btn btn-danger" disabled onclick="deleteEntry('${registrationNumber}')"><i class="fa fa-times"></i></button></td>
                            `;
                        })
                        .catch((error) => {
                            console.error("Error writing document: ", error);
                        });
                }
            });
    } catch (e) {
        console.error(`Error marking attendance for ${registrationNumber}`, e);
    }
}

function markLunch(registrationNumber) {
    try {
        var db = firebase.firestore();

        db.collection("registrations")
            .doc(`${registrationNumber}`)
            .get()
            .then((doc) => {
                if (!doc.exists) {
                    alert("Invalid registration number");
                    return;
                }
                if (doc.data().lunch) {
                    alert("Lunch already taken for this user");
                    return;
                } else {
                    db.collection("registrations")
                        .doc(`${registrationNumber}`)
                        .set({ lunch: true }, { merge: true })
                        .then(() => {
                            alert("Lunch availed successfully");
                            fetchAllAttendedUserData();
                        })
                        .catch((error) => {
                            console.error("Error writing document: ", error);
                        });
                }
            });
    } catch (e) {
        console.error(`Error availing lunch for ${registrationNumber}`, e);
    }
}

function markSwags(registrationNumber) {
    try {
        var db = firebase.firestore();

        db.collection("registrations")
            .doc(`${registrationNumber}`)
            .get()
            .then((doc) => {
                if (!doc.exists) {
                    alert("Invalid registration number");
                    return;
                }
                if (doc.data().swags) {
                    alert("Swags already taken for this user");
                    return;
                } else {
                    db.collection("registrations")
                        .doc(`${registrationNumber}`)
                        .set({ swags: true }, { merge: true })
                        .then(() => {
                            alert("Swags availed successfully");
                            fetchAllAttendedUserData();
                        })
                        .catch((error) => {
                            console.error("Error writing document: ", error);
                        });
                }
            });
    } catch (e) {
        console.error(`Error availing swags for ${registrationNumber}`, e);
    }
}

function uploadCSVData() {
    var db = firebase.firestore();

    var tableBody = document.getElementById("csvTableBody");
    var rows = tableBody.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        var cols = rows[i].getElementsByTagName("td");
        try {
            var registrationNumber = cols[0].innerText;
            var name = cols[1].innerText;
            db.collection("registrations")
                .doc(`${registrationNumber}`)
                .set({
                    name: name,
                    attendance: false,
                    lunch: false,
                    swags: false,
                    id: registrationNumber,
                })
                .then(() => {
                    console.log("Document written successfully!");
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                });
        } catch (e) {   
            console.error("Error uploading data", e);
        }
    }
    alert("Data uploaded successfully! Refresh to load the data in the table.");
    
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