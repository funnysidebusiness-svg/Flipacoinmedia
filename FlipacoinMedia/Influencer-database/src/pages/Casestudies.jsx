import React, { useState, useEffect } from "react";
import "../styles.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useRef } from "react";
import dummyCampaigns from "../data/casestudy.json";

export default function CaseStudies() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReel, setCurrentReel] = useState(null);
  const [creatorsData, setCreatorsData] = useState([]);
  const [touchStart, setTouchStart] = useState(0);
  const [playingReel, setPlayingReel] = useState(null);
  const [mutedReels, setMutedReels] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    const fetchCreators = async () => {
      const snapshot = await getDocs(collection(db, "creators"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCreatorsData(data);
    };

    fetchCreators();
  }, []);

  const getCreatorsForCampaign = (campaign) => {
    return creatorsData.filter((c) => campaign.creators.includes(c.name));
  };

  return (
    <div className="container">
      <h1 className="page-title">Case Studies</h1>

      {/* CARDS */}
      <div className="case-grid">
        {dummyCampaigns.map((c) => (
          <div
            key={c.id}
            className="case-card"
            onClick={() => {
              setSelectedCampaign(c);
              setCurrentSlide(0);
              setCurrentReel(null);
            }}
          >
            {/* BADGE */}
            <div className="reels-badge">🎬 {c.reels}</div>

            <div className="case-card-content">
              {/* LEFT */}
              <div className="card-left">
                <img src={c.logo} className="card-brand-logo" />
                <h2>{c.name} Campaign </h2>
              </div>

              {/* RIGHT */}
              <div className="card-right">
                <div className="card-arrow">→</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedCampaign && (
        <div className="modal-overlay">
          <div className="case-modal">
            {/* HEADER */}
            <div className="case-header centered">
              <button
                className="close-btn"
                onClick={() => setSelectedCampaign(null)}
              >
                ✕
              </button>

              {currentSlide !== 3 && (
                <div className="case-header-center">
                  <img src={selectedCampaign.logo} className="modal-logo" />
                  <h2>{selectedCampaign.name} Campaign</h2>
                </div>
              )}
            </div>

            {/* BODY */}
            <div className="case-body">
              {/* CREATORS */}
              {currentSlide === 0 && (
                <div className="slide modern">
                  {/* <h3>Creators</h3> */}

                  <div className="creator-grid-modal">
                    {getCreatorsForCampaign(selectedCampaign).map((creator) => (
                      <div key={creator.id} className="creator-mini-card">
                        <img src={creator.creatorImage} />
                        <div className="creator-info">
                          <h4>{creator.name}</h4>
                          <p className="creator-genre">{creator.genre}</p>
                          <p className="creator-followers">
                            {Number(creator.instagramFollowers).toLocaleString(
                              "en-US",
                            )}{" "}
                            followers
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REELS */}
              {currentSlide === 1 && (
                <div className="reel-grid">
                  {selectedCampaign.reelCovers.map((reel, i) => {
                    const creator = creatorsData.find(
                      (c) => c.name === reel.creator,
                    );

                    const isPlaying = currentReel === i && playingReel === i;

                    return (
                      <div
                        key={i}
                        className={`reel-card ${isPlaying ? "active" : ""}`}
                      >
                        {currentReel === i ? (
                          <>
                            <video
                              ref={(el) => (videoRefs.current[i] = el)}
                              src={reel.video}
                              className="reel-video"
                              muted={mutedReels[i] ?? true}
                              playsInline
                              webkit-playsinline="true"
                              style={{
                                position: "relative",
                                zIndex: 1,
                              }}
                              onPlay={() => setPlayingReel(i)}
                              onPause={() => setPlayingReel(null)}
                              onClick={(e) => {
                                if (e.target.paused) {
                                  e.target.play();
                                } else {
                                  e.target.pause();
                                }
                              }}
                            />

                            {/* 🔊 MUTE BUTTON */}
                            <button
                              className="mute-btn"
                              onClick={(e) => {
                                e.stopPropagation();

                                const video = videoRefs.current[i];

                                if (!video) return;

                                const isMuted = mutedReels[i] ?? true;

                                if (isMuted) {
                                  // 🔥 unmuting → must ensure user gesture
                                  video.muted = false;
                                  video.play(); // force play with sound
                                } else {
                                  video.muted = true;
                                }

                                setMutedReels((prev) => ({
                                  ...prev,
                                  [i]: !isMuted,
                                }));
                              }}
                            >
                              <span>
                                {(mutedReels[i] ?? true) ? "🔇" : "🔊"}
                              </span>
                            </button>
                          </>
                        ) : (
                          <div
                            className="reel-cover"
                            onClick={() => {
                              // 🔥 pause all videos first
                              Object.values(videoRefs.current).forEach(
                                (video) => {
                                  if (video) video.pause();
                                },
                              );

                              setCurrentReel(i);

                              // small delay ensures DOM mounts before play
                              setTimeout(() => {
                                const video = videoRefs.current[i];
                                if (video) video.play();
                              }, 50);
                            }}
                          >
                            <img
                              src={reel.cover || "/reels/default.jpg"}
                              alt="cover"
                            />
                          </div>
                        )}

                        {creator && (
                          <div className="reel-creator">
                            <img src={creator.creatorImage} />
                            <span>{creator.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* IMPACT */}
              {currentSlide === 2 && (
                <div className="slide modern impact-section">
                  <div className="impact-grid modern">
                    <div className="impact-card highlight">
                      <span className="impact-icon">👀</span>
                      <h2>{selectedCampaign.views}</h2>
                      <p>Views</p>
                    </div>

                    <div className="impact-card">
                      <span className="impact-icon">❤️</span>
                      <h2>{selectedCampaign.likes}</h2>
                      <p>Likes</p>
                    </div>

                    <div className="impact-card">
                      <span className="impact-icon">💬</span>
                      <h2>{selectedCampaign.comments}</h2>
                      <p>Comments</p>
                    </div>

                    <div className="impact-card">
                      <span className="impact-icon">🔁</span>
                      <h2>{selectedCampaign.shares}</h2>
                      <p>Shares</p>
                    </div>

                    <div className="impact-card">
                      <span className="impact-icon">🚀</span>
                      <h2>{selectedCampaign.reposts}</h2>
                      <p>Reposts</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {currentSlide === 3 && (
                <div className="slide modern summary-section">
                  <div className="summary-card">
                    <img src={selectedCampaign.logo} className="summary-logo" />
                    <h3>
                      {selectedCampaign.name}
                      <br></br> Campaign Summary
                    </h3>

                    <p className="summary-text">{selectedCampaign.summary}</p>

                    {/* OPTIONAL HIGHLIGHTS */}
                    <div className="summary-highlights">
                      <div className="summary-pill">
                        {selectedCampaign.summaryicon1}
                      </div>
                      <div className="summary-pill">
                        {selectedCampaign.summaryicon2}
                      </div>
                      <div className="summary-pill">
                        {selectedCampaign.summaryicon3}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ SLIDE NAVIGATION (THIS WAS MISSING) */}
            <div className="case-footer">
              <button
                style={{ visibility: currentSlide > 0 ? "visible" : "hidden" }}
                onClick={() => setCurrentSlide((s) => Math.max(s - 1, 0))}
              >
                ←
              </button>

              <span>
                {
                  [
                    "Creators Part Of The Campaign",
                    "Reels",
                    "Impact",
                    "Summary",
                  ][currentSlide]
                }
              </span>

              <button
                style={{ visibility: currentSlide < 3 ? "visible" : "hidden" }}
                onClick={() => setCurrentSlide((s) => Math.min(s + 1, 3))}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
