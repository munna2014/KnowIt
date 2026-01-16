import AuthShell from "./AuthShell";

export const metadata = {
  title: "Create Account | KnowIt",
  description: "Create a KnowIt account to start sharing and connecting.",
};

export default function RegisterLayout({ children }) {
  return (
    <AuthShell
      eyebrow="Join KnowIt"
      heading="Build a space that feels like home."
      description="Create your account, personalize your profile, and start sharing stories with the people who matter."
    >
      {children}
    </AuthShell>
  );
}
