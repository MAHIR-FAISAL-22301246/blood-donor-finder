import { NextRequest, NextResponse } from "next/server";
import BloodRequest from "@/models/BloodRequest";
import dbConnect from "@/lib/db";


// GET /api/requests
export async function getBloodRequests(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const bloodGroup = searchParams.get("bloodGroup");
    const status = searchParams.get("status") || "open";
    const district = searchParams.get("district");

    const query: any = {
      status,
    };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (district) {
      query["location.district"] = district;
    }

    
    const requests = await BloodRequest.find(query)
      .sort({ createdAt: -1 });


    return NextResponse.json(
      {
        success: true,
        data: requests,
      },
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error("GET REQUEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch requests",
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}



// POST /api/requests
export async function createBloodRequest(req: NextRequest) {

  try {

    await dbConnect();

    const body = await req.json();
    console.log("BloodRequest model:", BloodRequest);
    const request = await BloodRequest.create(body);


    return NextResponse.json(
      {
        success: true,
        data: request,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error("CREATE REQUEST ERROR:", error);

    return NextResponse.json(
      {
        success:false,
        message:"Failed to create request",
        error:String(error),
      },
      {
        status:400,
      }
    );

  }
}



// PATCH /api/requests/:id
export async function updateRequestStatus(
  id:string,
  status:"open" | "fulfilled" | "cancelled"
){

  try {

    await dbConnect();


    const request = await BloodRequest.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new:true,
      }
    );


    if(!request){

      return NextResponse.json(
        {
          success:false,
          message:"Request not found",
        },
        {
          status:404,
        }
      );

    }


    return NextResponse.json(
      {
        success:true,
        data:request,
      },
      {
        status:200,
      }
    );


  } catch(error){

    console.error("UPDATE REQUEST ERROR:", error);


    return NextResponse.json(
      {
        success:false,
        message:"Failed to update request",
        error:String(error),
      },
      {
        status:500,
      }
    );

  }

}