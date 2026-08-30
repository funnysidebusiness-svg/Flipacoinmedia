export default function InfluencerCard({ influencer }) {
  const total = (influencer.instagramFollowers || 0) + (influencer.youtubeFollowers || 0);
  const nf = new Intl.NumberFormat();

  return (
    <div className="card">
      <img src={influencer.image} alt={influencer.name} loading="lazy" />
      <h2>{influencer.name}</h2>
      <div className="meta">
        <span className="badge">{influencer.genre}</span>
        <span className="badge">{influencer.location}</span>
      </div>

      <div className="counts">
        {influencer.instagramUrl ? (
          <a
            href={influencer.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="count-box"
          >
            Instagram<br />
            <strong>{nf.format(influencer.instagramFollowers || 0)}</strong>
          </a>
        ) : (
          <div className="count-box">
            Instagram<br />
            <strong>{nf.format(influencer.instagramFollowers || 0)}</strong>
          </div>
        )}

        {influencer.youtubeUrl ? (
          <a
            href={influencer.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="count-box"
          >
            YouTube<br />
            <strong>{nf.format(influencer.youtubeFollowers || 0)}</strong>
          </a>
        ) : (
          <div className="count-box">
            YouTube<br />
            <strong>{nf.format(influencer.youtubeFollowers || 0)}</strong>
          </div>
        )}
      </div>

      <p style={{ marginTop: '0.7rem' }}>
        Total followers: <strong>{nf.format(total)}</strong>
      </p>
    </div>
  );
}
