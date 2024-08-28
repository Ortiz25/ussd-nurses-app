import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import UssdMenu from "ussd-builder";
import {
  checkRegistration,
  queeryNurseDetails,
  getNurseId,
  getPaymentInfo,
  getNckOffices,
  getNckOfficeDetail,
  getTrnInstitutions,
  getInstitutionDetail,
  getExams,
  getExamDetail,
  checkRegistrationNumber,
} from "./util/helpers.js";

const app = express();
const menu = new UssdMenu();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Sessions
let sessions = {};
let next;

menu.sessionConfig({
  start: (sessionId, callback) => {
    // initialize current session if it doesn't exist
    // this is called by menu.run()
    if (!(sessionId in sessions)) sessions[sessionId] = {};
    callback();
  },
  end: (sessionId, callback) => {
    // clear current session
    // this is called by menu.end()
    delete sessions[sessionId];
    callback();
  },
  set: (sessionId, key, value, callback) => {
    // store key-value pair in current session
    sessions[sessionId][key] = value;
    callback();
  },
  get: (sessionId, key, callback) => {
    // retrieve value by key in current session
    let value = sessions[sessionId][key];
    callback(null, value);
  },
});

/////////////////////////// GET METHODS ////////////////////////////////////

app.get("/", async function (req, res) {
  // const token = await getOAuthToken();
  // console.log(token);
  res.send("Hello World");
});

/////////////////////////////////////////////////////////////////////////////

//////////////////////////// POST METHODS ///////////////////////////////////
app.post("/ussd", async function (req, res) {
  let string = "";
  let string2 = "";
  // Read the variables sent via POST from our API
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  // Define menu states
  menu.startState({
    run: () => {
      menu.con(
        `Welcome to Nurses' Portal:
          1. Proceed:
          0. Exit:`
      );
    },

    next: {
      0: "Exit",
      1: "proceed",
    },
  });

  menu.state("proceed", {
    run: () => {
      menu.con(`Select a Service:
                   1.Nurse's-Profile
                   2.NCK-Offices
                   3.Training-Institutions (Approved)
                   4.Exams-Schedules
                   5.Registration-Status`);
    },
    next: {
      1: "My-Profile",
      2: "NCK-Offices",
      3: "Training-Institutions",
      4: "Exams-Schedules",
      5: "Registration-Status",
    },
  });

  ////////////// MY-PROFILE //////////////////

  menu.state("My-Profile", {
    run: () => {
      menu.con(`Enter Your National ID Number:`);
    },
    next: {
      "*\\d+": "id.number",
    },
  });

  menu.state("id.number", {
    run: async () => {
      let id = menu.val;
      await menu.session.set("id", id);
      menu.con("Enter your Phone number (0722 XXX XXX):");
    },
    next: {
      "*^(\\+254|0)7\\d{8}$": "registration.number",
    },
  });

  menu.state("registration.number", {
    run: async () => {
      let number = menu.val;
      const id = await menu.session.get("id");
      //console.log(number, id);
      await menu.session.set("phoneNumber", number);
      const nurse = await checkRegistration(id, number);
      //console.log(nurse);
      if (!nurse) {
        menu.end(`Sorry, Nurse with ID "${id}" does not exist`);
      }
      await menu.session.set("nurse", nurse);
      menu.con(`Select Desired Service:
                  1.Index-number
                  2.Tracking-number
                  3.Registration number
                  4.Registation Cert Status
                  5.License Status
                  6.Payment Status`);
    },
    next: {
      1: "Index-number",
      2: "Tracking-number",
      3: "Registration-number",
      4: "Registation-Cert-Status",
      5: "License-Status",
      6: "Payment",
    },
  });
  menu.state("Index-number", {
    run: async () => {
      const nurse = await menu.session.get("nurse");
      const nurseDetails = await queeryNurseDetails(nurse);
      menu.end(`Name: ${nurse}
      Index-Number: ${nurseDetails.indexNumber}`);
    },
  });
  menu.state("Tracking-number", {
    run: async () => {
      const nurse = await menu.session.get("nurse");
      const nurseDetails = await queeryNurseDetails(nurse);
      menu.end(`Name: ${nurse}
      Tracking-Number: ${nurseDetails.trackingNumber}`);
    },
  });
  menu.state("Registration-number", {
    run: async () => {
      const nurse = await menu.session.get("nurse");
      const nurseDetails = await queeryNurseDetails(nurse);
      menu.end(`Name: ${nurse}
      Registration-Number: ${nurseDetails.regNumber}`);
    },
  });
  menu.state("Registation-Cert-Status", {
    run: async () => {
      const nurse = await menu.session.get("nurse");
      const nurseDetails = await queeryNurseDetails(nurse);
      menu.end(`Name: ${nurse}
      Registation-Cert: ${
        nurseDetails.regCertificate ? "AVAILABLE" : "UNAVAILABLE"
      }`);
    },
  });
  menu.state("License-Status", {
    run: async () => {
      const nurse = await menu.session.get("nurse");
      const nurseDetails = await queeryNurseDetails(nurse);
      menu.end(`Name: ${nurse}
      Private-Practise-License: ${
        nurseDetails.licenseStatus ? "AVAILABLE" : "UNAVAILABLE"
      }`);
    },
  });
  menu.state("Payment", {
    run: async () => {
      const nurse = await menu.session.get("nurse");
      const nurseId = await getNurseId(nurse);
      const paymentInfo = await getPaymentInfo(nurseId);
      menu.end(`Name: ${nurse}
      Payment Date: ${paymentInfo.payDate}
      Payment Amount: ${paymentInfo.payAmount}
      Renawal Date: ${paymentInfo.renewalDate}
      Payment RefNo: ${paymentInfo.payRef}
      `);
    },
  });

  ////////////// NCK-OFFICES //////////////////

  menu.state("NCK-Offices", {
    run: async () => {
      const offices = await getNckOffices();
      //console.log(offices);
      await menu.session.set("officeArray", offices);
      offices.map((office, index) => {
        string2 += `${index + 1}. ${office}
     `;
      });
      console.log(string2);
      next = `*[1-${offices.length}]`;
      menu.con(`Select Prefered NCK-Office:
      ${string2}`);
    },
    next: {
      [next]: "office",
    },
  });

  menu.state("office", {
    run: async () => {
      let officeIndx = menu.val;
      const offices = await menu.session.get("officeArray");
      const office = offices.at(officeIndx - 1);
      console.log(office);
      const officeDetails = await getNckOfficeDetail(office);
      console.log(officeDetails);
      menu.end(`  Name: ${officeDetails.name}
      Location: ${officeDetails.location}
      Contacts: ${officeDetails.contacts}
      `);
    },
  });

  ////////////// TRAINING-INSTITUUTIONS //////////////////
  menu.state("Training-Institutions", {
    run: async () => {
      const institutions = await getTrnInstitutions();
      await menu.session.set("instArray", institutions);
      institutions.map((institution, index) => {
        string2 += `${index + 1}. ${institution}
     `;
      });
      next = `*[1-${institutions.length}]`;
      menu.con(`Select Prefered Approved Institution:
      ${string2}`);
    },
    next: {
      [next]: "institution",
    },
  });

  menu.state("institution", {
    run: async () => {
      let instIndx = menu.val;
      const instArray = await menu.session.get("instArray");
      const institution = instArray.at(instIndx - 1);
      console.log(institution);
      const instituteDetails = await getInstitutionDetail(institution);
      console.log(instituteDetails);
      menu.end(`  Institution: ${instituteDetails.name}
      Location: ${instituteDetails.location}
      Contacts: ${instituteDetails.contacts}
      `);
    },
  });

  ////////////// Exams-Schedules//////////////////
  menu.state("Exams-Schedules", {
    run: async () => {
      const exams = await getExams();
      await menu.session.set("examArray", exams);
      exams.map((exam, index) => {
        string2 += `${index + 1}. ${exam}
       `;
      });
      next = `*[1-${exams.length}]`;
      menu.con(`Select Prefered Examination:
        ${string2}`);
    },
    next: {
      1: "exams",
    },
  });

  menu.state("exams", {
    run: async () => {
      let examIndx = menu.val;
      const examArray = await menu.session.get("examArray");
      const exam = examArray.at(examIndx - 1);
      console.log(exam);
      const examDetails = await getExamDetail(exam);

      menu.end(`  Exam: ${examDetails.name}
      Exam-Date: ${examDetails.date}
      Location: ${examDetails.location}
      Application-Deadline: ${examDetails.deadline}
      Release-Date: ${examDetails.release}
      `);
    },
  });
  ////////////// Registration-Status//////////////////
  menu.state("Registration-Status", {
    run: async () => {
      menu.con("Enter Nurse Registration Number:");
    },
    next: {
      "*[a-zA-Z]+": "registration",
    },
  });

  menu.state("registration", {
    run: async () => {
      let registrationNumber = menu.val.toUpperCase();
      const nurse = await checkRegistrationNumber(registrationNumber);
      console.log(nurse);
      if (nurse) {
        menu.end(
          `${nurse.toUpperCase()} with Registration Number "${registrationNumber}" is a Registered Nurse with NCK.`
        );
      }
      if (!nurse) {
        menu.end(
          `There is currently no Nurse with Registration Number "${registrationNumber}" at NCK.`
        );
      }
    },
  });

  menu.state("Exit", {
    run: async () => {
      let currentDate = new Date();
      let hours = currentDate.getHours();
      let greetings;

      function displayTime() {
        hours = hours < 10 ? "0" + hours : hours;
        return hours;
      }
      let hour = displayTime();

      if (hour < 12) {
        greetings = "Good Day!";
      } else if (hour >= 12 && hour < 17) {
        greetings = "Good Afternoon!";
      } else if (hour >= 17 && hour < 20) {
        greetings = "Good Evening!";
      } else if (hour >= 20) {
        greetings = "Good Night!";
      } else {
        greetings = "Bye!";
      }
      menu.end(`Thanks for Your Time!, Have a ${greetings}`);
    },
  });

  // Send the response back to the API
  menu.run(req.body, (ussdResult) => {
    res.send(ussdResult);
  });
});

////////////////////////Start the server/////////////////////////////////////
const PORT = 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
