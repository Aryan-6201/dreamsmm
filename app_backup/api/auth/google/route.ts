import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credential = body?.credential;

    if (!credential) {
      return NextResponse.json(
        {
          error: "Google credential is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* ----------------------------------------------------------
       VERIFY GOOGLE ID TOKEN
    ---------------------------------------------------------- */

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json(
        {
          error:
            "Could not verify your Google account.",
        },
        {
          status: 401,
        }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        {
          error:
            "Could not get your Google email.",
        },
        {
          status: 400,
        }
      );
    }

    /* ----------------------------------------------------------
       GOOGLE USER DETAILS
    ---------------------------------------------------------- */

    const email = payload.email
      .toLowerCase()
      .trim();

    const name =
      payload.name?.trim() ||
      "DreamSMM User";

    /* ----------------------------------------------------------
       FIND USER
    ---------------------------------------------------------- */

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    /* ----------------------------------------------------------
       CREATE USER IF NOT EXISTS
    ---------------------------------------------------------- */

    if (!user) {
      const randomPassword =
        crypto.randomBytes(32).toString("hex");

      const passwordHash =
        await bcrypt.hash(
          randomPassword,
          12
        );

      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          lastLoginAt: new Date(),
          lastSeenAt: new Date(),
        },
      });
    }

    /* ----------------------------------------------------------
       UPDATE EXISTING USER
    ---------------------------------------------------------- */

    else {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          lastLoginAt: new Date(),
          lastSeenAt: new Date(),

          /*
           * Don't overwrite an existing
           * custom name with Google's name.
           */
          name: user.name || name,
        },
      });
    }

    /* ----------------------------------------------------------
       CREATE SESSION
    ---------------------------------------------------------- */

    const token = await createSession(
      user.id
    );

    /* ----------------------------------------------------------
       RESPONSE
    ---------------------------------------------------------- */

    const response = NextResponse.json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance:
          user.balance.toString(),
      },
    });

    /* ----------------------------------------------------------
       SESSION COOKIE
    ---------------------------------------------------------- */

    response.cookies.set(
      "session",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        maxAge:
          60 * 60 * 24 * 7,

        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Google login error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Google login failed.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 401,
      }
    );
  }
}
