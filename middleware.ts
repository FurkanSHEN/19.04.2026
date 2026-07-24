import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res = NextResponse.next({ request: { headers: req.headers } });
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

 const adminRoute   = path.startsWith("/admin");
  const vendorRoute  = path.startsWith("/vendors-dashboard");
  const hesabimRoute = path.startsWith("/hesabim");
  const korumaRoute   = adminRoute || vendorRoute || hesabimRoute;

  if (korumaRoute && !user) {
    return NextResponse.redirect(new URL("/giris", req.url));
  }

  if (user && korumaRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    const rol = profile?.rol || "musteri";

    if (adminRoute && rol !== "admin") {
      return NextResponse.redirect(new URL(
        rol === "vendor" ? "/vendors-dashboard" : "/hesabim", req.url
      ));
    }

    if (vendorRoute && rol !== "vendor" && rol !== "admin") {
      return NextResponse.redirect(new URL("/hesabim", req.url));
    }

    if (hesabimRoute && rol === "vendor") {
      return NextResponse.redirect(new URL("/vendors-dashboard", req.url));
    }

    if (hesabimRoute && rol === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (user && path === "/giris") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    const rol = profile?.rol || "musteri";
    if (rol === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    if (rol === "vendor") return NextResponse.redirect(new URL("/vendors-dashboard", req.url));
    return NextResponse.redirect(new URL("/hesabim", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendors-dashboard/:path*",
    "/hesabim/:path*",
    "/giris",
  ],
};