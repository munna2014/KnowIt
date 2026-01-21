export default function AdvancedLanding() {
  return (
    <section className="advanced-landing">
      <div className="advanced-landing__hero">
        <div>
          <p className="advanced-landing__eyebrow">KnowIt</p>
          <h1 className="advanced-landing__title">
            Share ideas, collect resources, and stay in sync.
          </h1>
          <p className="advanced-landing__subtitle">
            A simple space for your team to publish updates, surface links, and
            keep momentum visible.
          </p>
          <div className="advanced-landing__actions">
            <button className="advanced-landing__cta">Get started</button>
            <button className="advanced-landing__ghost">Browse updates</button>
          </div>
        </div>
        <div className="advanced-landing__card">
          <h2>Today</h2>
          <ul>
            <li>New design resources in the library</li>
            <li>Engineering weekly notes are live</li>
            <li>Community Q&amp;A on Thursday</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
