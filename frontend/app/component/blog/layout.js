export const metadata = {
  title: "Blog | KnowIt",
  description: "Browse KnowIt posts, resources, and insights.",
};

export default function BlogLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {children}
    </div>
  );
}
