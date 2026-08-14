import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, dealType, propertyType, preferredLocation, budget, message } = data;

    // Server-side validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: "Please enter your full name (minimum 3 characters)." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid electronic mail address." }, { status: 400 });
    }

    if (!phone || phone.trim().length < 6) {
      return NextResponse.json({ error: "Please provide a valid contact telephone number." }, { status: 400 });
    }

    // Generate luxurious reservation reference code
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const referenceCode = `PGM-2026-${randomHex}`;

    // Return successful response mimicking database saving
    return NextResponse.json({
      success: true,
      message: "Your bespoke quotation inquiry has been registered with our senior partners.",
      referenceCode,
      timestamp: new Date().toISOString(),
      details: {
        name,
        preferredLocation,
        budget,
        propertyType
      }
    });

  } catch (error: any) {
    console.error("Contact Form API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred while processing your invitation. Please contact our main desk." }, { status: 500 });
  }
}
