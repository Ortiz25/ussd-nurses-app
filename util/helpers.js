import * as dotenv from "dotenv";
dotenv.config();
import { Nurse, Institution, NCK_Office, Payment, Exam } from "../db/db.js";

export async function checkRegistration(id, phoneNumber) {
  try {
    const nurse = await Nurse.findOne({
      attributes: ["name"],
      where: { id_number: id, phone_number: phoneNumber },
    });

    return nurse.name;
  } catch (error) {
    console.log(error);
  }
}
export async function getExams() {
  try {
    const examArray = [];
    const exams = await Exam.findAll({
      attributes: ["exam_name"],
    });

    exams.forEach((exam) => {
      examArray.push(exam.exam_name);
    });
    return examArray;
  } catch (e) {
    console.error("Error getting user ID:", e);
  }
}
export async function getExamDetail(name) {
  try {
    const exam = await Exam.findOne({
      attributes: [
        "exam_name",
        "exam_date",
        "location",
        "application_deadline",
        "release_date",
      ],
      where: { exam_name: name },
    });

    return {
      name: exam.exam_name,
      date: exam.exam_date,
      location: exam.location,
      deadline: exam.application_deadline,
      release: exam.release_date,
    };
  } catch (e) {
    console.error("Error getting user ID:", e);
  }
}

export async function getTrnInstitutions() {
  try {
    const institutionaArray = [];
    const institutions = await Institution.findAll({
      attributes: ["institution_name"],
    });

    institutions.forEach((institution) => {
      institutionaArray.push(institution.institution_name);
    });
    return institutionaArray;
  } catch (e) {
    console.error("Error getting user ID:", e);
  }
}

export async function getInstitutionDetail(name) {
  try {
    const institute = await Institution.findOne({
      attributes: ["institution_name", "location", "contact_details"],
      where: { institution_name: name },
    });

    return {
      name: institute.institution_name,
      location: institute.location,
      contacts: institute.contact_details,
    };
  } catch (e) {
    console.error("Error getting user ID:", e);
  }
}

export async function getNckOffices() {
  try {
    const officeArray = [];
    const nckOffices = await NCK_Office.findAll({
      attributes: ["office_name"],
    });

    nckOffices.forEach((office) => {
      officeArray.push(office.office_name);
    });
    return officeArray;
  } catch (e) {
    console.error("Error getting user ID:", e);
  }
}
export async function getNckOfficeDetail(name) {
  try {
    const nckOffice = await NCK_Office.findOne({
      attributes: ["office_name", "location", "contact_details"],
      where: { office_name: name },
    });

    return {
      name: nckOffice.office_name,
      location: nckOffice.location,
      contacts: nckOffice.contact_details,
    };
  } catch (e) {
    console.error("Error getting user ID:", e);
  }
}

export async function getPaymentInfo(id) {
  try {
    const pay = await Payment.findOne({
      attributes: [
        "payment_amount",
        "payment_date",
        "renewal_date",
        "payment_reference",
      ],
      where: { nurse_id: id },
    });

    return {
      payAmount: pay.payment_amount,
      payDate: pay.payment_date,
      renewalDate: pay.renewal_date,
      payRef: pay.payment_reference,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getNurseId(name) {
  try {
    const nurse = await Nurse.findOne({
      attributes: ["nurse_id"],
      where: { name: name },
    });

    return nurse.nurse_id;
  } catch (error) {
    console.log(error);
  }
}

export async function queeryNurseDetails(name) {
  try {
    const nurse = await Nurse.findOne({
      attributes: [
        "registration_no",
        "index_number",
        "id_number",
        "registration_date",
        "dob",
        "gender",
        "phone_number",
        "location",
        "email",
        "address",
        "tracking_number",
        "private_practice_license_ready",
        "registration_certificate_ready",
      ],
      where: { name: name },
    });

    return {
      indexNumber: nurse.index_number,
      regNumber: nurse.registration_no,
      trackingNumber: nurse.tracking_number,
      licenseStatus: nurse.private_practice_license_ready,
      regCertificate: nurse.registration_certificate_ready,
      location: nurse.location,
      email: nurse.email,
      gender: nurse.gender,
      dob: nurse.dob,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function checkRegistrationNumber(number) {
  try {
    const nurse = await Nurse.findOne({
      attributes: ["name"],
      where: { registration_no: number },
    });

    return nurse?.name;
  } catch (error) {
    console.log(error);
  }
}
