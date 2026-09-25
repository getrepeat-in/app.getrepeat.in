import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      appearance={{
        layout: {
          logoImageUrl: "/assets/logo/getrepeat-logo.webp",
        },
      }}
    />
  );
}

