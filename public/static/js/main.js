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
        var registrationNumber = result.registrationNumber;
        if (registrationNumber) {
          getUserData(registrationNumber);
        }
        // result.forEach((data) => {
        //   const registrationNumber = data.registrationNumber;
        //   if (registrationNumber) {
        //     getUserData(registrationNumber);
        //   }
        // });
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
          const tedxTitle = document.getElementById("fbs-tedx");
          const mainAttendanceBtn = document.getElementById("fbs-attendance-btn-main");
          const heroSectionTitle = document.getElementById("fbs-title");
          const heroSectionDescription =
            document.getElementById("fbs-description");

          heroSectionTitle.innerHTML = `<span class="text-line"> Hello,</span><br>
                    <span class="wow fadeInLeft" data-wow-delay=".4s">${data.name
            }</span>`;
          heroSectionTitle.style.display = "block";

          heroSectionDescription.innerHTML =
            `<span class="text-line-small">
                Thank you for attending TEDx AJCE 2024 🎉
            </span>`;

          heroSectionDescription.style.display = "block";
          mainAttendanceBtn.style.display = "none";
          tedxTitle.style.display = "none";
          document.getElementById('modal-close').click();

        } else {
          console.log("No such document!");
          alert("Could not find the user with the given registration number");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  } catch (e) {
    console.error(e);
  }
}
