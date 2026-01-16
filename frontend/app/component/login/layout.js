import AuthShell from "./AuthShell";

export const metadata = {
  title: "Login | KnowIt",
  description: "Log in to KnowIt and reconnect with your community.",
};

export default function LoginLayout({ children }) {
  return (
    <AuthShell
      eyebrow="Your community awaits"
      heading="Pick up the conversation in seconds."
      description="Stay close to friends, family, and groups with a clean, focused feed that keeps everyone in sync."
    >
      {children}
    </AuthShell>
  );
}
