export default function BlogDetails({ post }) {
  return (
    <article className="w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)]">
      <div className="relative h-80 overflow-hidden sm:h-[28rem]">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-6 p-8 sm:p-10 text-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] text-slate-600">
            {post.category}
          </span>
          <span className="text-[11px] text-slate-500">{post.date}</span>
        </div>
        <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
          {post.title}
        </h1>
        <p className="text-lg text-slate-600">{post.description}</p>

        <div className="flex items-center gap-3 text-base text-slate-600">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {post.author
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </span>
          <span>{post.author}</span>
        </div>

        <div className="space-y-4 text-base text-slate-600">
          <p>
            This post is part of the KnowIt community feed. Share what you are
            learning, ask questions, and connect with creators who inspire your
            work.
          </p>
          <p>
            Use the navigation above to explore more posts, or return to the
            blog feed for the latest updates.
          </p>
        </div>
      </div>
    </article>
  );
}
