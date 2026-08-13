"use client";

import { useEffect, useState } from "react";

type Patient = {
  _id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  location: {
    division: string;
    district: string;
    area: string;
  };
  contactPhone: string;
  description: string;
  status: string;
};

export default function PatientDetails() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPatients(data.data);
        }
      });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-8">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🩸</div>

        <h1 className="text-4xl font-bold text-red-600">
          Blood Request Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Find patients who urgently need blood donation
        </p>
      </div>


      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {patients.map((patient) => (

          <div
            key={patient._id}
            className="
            bg-white 
            rounded-3xl 
            shadow-lg 
            border 
            border-gray-100
            p-6
            hover:shadow-2xl
            transition
            "
          >

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold text-gray-800">
                {patient.patientName}
              </h2>


              <span
                className="
                bg-red-500 
                text-white 
                px-4 
                py-2 
                rounded-full 
                font-bold
                "
              >
                {patient.bloodGroup}
              </span>

            </div>



            <div className="space-y-3 text-gray-600">


              <p>
                🏥 
                <b className="text-gray-800">
                  {" "}Hospital:
                </b>{" "}
                {patient.hospital}
              </p>


              <p>
                🩸
                <b className="text-gray-800">
                  {" "}Units:
                </b>{" "}
                {patient.unitsNeeded}
              </p>



              <p>
                📍
                <b className="text-gray-800">
                  {" "}Location:
                </b>{" "}
                {patient.location.area},{" "}
                {patient.location.district}
              </p>



              <p>
                ⚠️
                <b className="text-gray-800">
                  {" "}Status:
                </b>{" "}
                {patient.status}
              </p>


              <p className="text-sm">
                {patient.description}
              </p>


            </div>



            <button
              onClick={() => setSelectedPatient(patient)}
              className="
              mt-6
              w-full
              bg-gradient-to-r
              from-red-500
              to-pink-500
              text-white
              py-3
              rounded-xl
              font-semibold
              hover:scale-105
              transition
              "
            >
              Contact Patient
            </button>


          </div>

        ))}

      </div>



      {/* Contact Modal */}

      {selectedPatient && (

        <div
          className="
          fixed
          inset-0
          bg-black/40
          flex
          items-center
          justify-center
          "
        >

          <div
            className="
            bg-white
            rounded-3xl
            p-8
            w-[90%]
            max-w-md
            shadow-2xl
            "
          >

            <h2 className="text-2xl font-bold mb-5 text-red-600">
              Contact Patient
            </h2>


            <p className="mb-2">
              👤 {selectedPatient.patientName}
            </p>


            <p className="mb-5">
              📞 {selectedPatient.contactPhone}
            </p>



            <a
              href={`tel:${selectedPatient.contactPhone}`}
              className="
              block
              text-center
              bg-green-500
              text-white
              py-3
              rounded-xl
              font-bold
              "
            >
              Call Now
            </a>



            <button
              onClick={() => setSelectedPatient(null)}
              className="
              mt-3
              w-full
              bg-gray-200
              py-3
              rounded-xl
              "
            >
              Close
            </button>


          </div>

        </div>

      )}


    </main>
  );
}