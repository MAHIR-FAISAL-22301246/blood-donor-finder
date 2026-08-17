"use client";

import { useEffect, useState } from "react";

type RequestStatus = "open" | "fulfilled" | "cancelled";

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
  status: RequestStatus;
};

export default function PatientDetails() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

useEffect(() => {
  const fetchPatients = async () => {
    try {
      const [openRes, fulfilledRes, cancelledRes] = await Promise.all([
        fetch("/api/requests?status=open"),
        fetch("/api/requests?status=fulfilled"),
        fetch("/api/requests?status=cancelled"),
      ]);

      const [openData, fulfilledData, cancelledData] = await Promise.all([
        openRes.json(),
        fulfilledRes.json(),
        cancelledRes.json(),
      ]);

      const allPatients = [
        ...(openData.success ? openData.data : []),
        ...(fulfilledData.success ? fulfilledData.data : []),
        ...(cancelledData.success ? cancelledData.data : []),
      ];

      setPatients(allPatients);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  fetchPatients();
}, []);


  const updateStatus = async (
    id: string,
    status: RequestStatus
  ) => {
    try {
      setUpdatingId(id);

      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update request");
      }

      setPatients((previousPatients) =>
        previousPatients.map((patient) =>
          patient._id === id
            ? { ...patient, status }
            : patient
        )
      );

      setSelectedPatient((previousPatient) =>
        previousPatient?._id === id
          ? { ...previousPatient, status }
          : previousPatient
      );
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Failed to update request status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusText = (status: RequestStatus) => {
    if (status === "fulfilled") {
      return "Accepted";
    }

    if (status === "cancelled") {
      return "Declined";
    }

    return "Open";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-8">

      {/* Header */}
      <div className="mb-10 text-center">

        <div className="text-5xl mb-3">
          🩸
        </div>

        <h1 className="text-4xl font-bold text-red-600">
          Blood Request Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Find patients who urgently need blood donation
        </p>

      </div>


      {/* Patient Cards */}
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

            {/* Patient Name + Blood Group */}
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


            {/* Patient Information */}
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

                <span
                  className={
                    patient.status === "fulfilled"
                      ? "font-bold text-green-600"
                      : patient.status === "cancelled"
                      ? "font-bold text-red-600"
                      : "font-bold text-orange-500"
                  }
                >
                  {getStatusText(patient.status)}
                </span>

              </p>


              <p className="text-sm">
                {patient.description}
              </p>

            </div>


            {/* Accept / Decline Buttons */}
            {patient.status === "open" && (

              <div className="grid grid-cols-2 gap-3 mt-6">

                <button
                  onClick={() =>
                    updateStatus(patient._id, "fulfilled")
                  }
                  disabled={updatingId === patient._id}
                  className="
                    bg-green-500
                    text-white
                    py-3
                    rounded-xl
                    font-semibold
                    hover:bg-green-600
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {updatingId === patient._id
                    ? "Updating..."
                    : "Accept"}
                </button>


                <button
                  onClick={() =>
                    updateStatus(patient._id, "cancelled")
                  }
                  disabled={updatingId === patient._id}
                  className="
                    bg-red-500
                    text-white
                    py-3
                    rounded-xl
                    font-semibold
                    hover:bg-red-600
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {updatingId === patient._id
                    ? "Updating..."
                    : "Decline"}
                </button>

              </div>

            )}


            {/* Accepted Message */}
            {patient.status === "fulfilled" && (

              <div
                className="
                  mt-6
                  text-center
                  bg-green-100
                  text-green-700
                  py-3
                  rounded-xl
                  font-bold
                "
              >
                ✓ Request Accepted
              </div>

            )}


            {/* Declined Message */}
            {patient.status === "cancelled" && (

              <div
                className="
                  mt-6
                  text-center
                  bg-red-100
                  text-red-700
                  py-3
                  rounded-xl
                  font-bold
                "
              >
                ✕ Request Declined
              </div>

            )}


            {/* Contact Patient Button */}
            <button
              onClick={() => setSelectedPatient(patient)}
              className="
                mt-4
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

