import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      appearance={{
        layout: {
          logoImageUrl: "/assets/logo/getrepeat-logo.webp",
        },
      }}
    />
  );
}

