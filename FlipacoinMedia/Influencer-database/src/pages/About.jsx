import React from "react";
import "../styles.css";

// A smaller version of your card without social counts
function TeamCard({ member }) {
  return (
    <div className="card">
      <img src={member.image} alt={member.name} loading="lazy" />
      <h2>{member.name}</h2>
      <div className="meta">
        <span className="badge">{member.role}</span>
      </div>
      <p style={{ marginTop: "0.6rem" }}>{member.bio}</p>
    </div>
  );
}

export default function About() {
  const brands = [
    { img: "../brand-images/rapido.png", url: "https://www.instagram.com/p/DFh2GMXoTpV/" },
    { img: "../brand-images/instamart.png", url: "https://www.instagram.com/p/DP0WzeUDEsE/" },
    { img: "../brand-images/atomberg.png", url: "" },
    { img: "../brand-images/dominos-hd.png", url: "https://www.instagram.com/p/DId7M6bI7F5/" },
    { img: "../brand-images/quillbot.png", url: "https://www.instagram.com/p/DRkK8hTDFJN/" },
    { img: "../brand-images/redrockdeli.png", url: "https://www.instagram.com/p/DRCoDbvEild/" },
    { img: "../brand-images/sprite.png", url: "https://www.instagram.com/p/DRjn5FWDLWR/" },
    { img: "../brand-images/reliance-fashion-factory.png", url: "https://www.instagram.com/reel/DP8Monrktgb/" },
    { img: "../brand-images/bathandcare.jpeg", url: "https://www.instagram.com/p/DRcJapSjMt6/" },
    { img: "../brand-images/poco.png", url: "https://www.instagram.com/p/DOyX7tCCNYV/" },
    { img: "../brand-images/uber-hd.png", url: "https://www.instagram.com/p/DC6dOEuy2k6/" },
    { img: "../brand-images/bbqnation.png", url: "https://www.instagram.com/p/DKeety_ofTb/" },
    { img: "../brand-images/wakefit-hd.png", url: "https://www.instagram.com/p/DMfS5QwpOij/" },
    { img: "../brand-images/country-delight.png", url: "https://www.instagram.com/p/DGfv_6PPgO4/" },
    { img: "../brand-images/amazon.png", url: "https://www.instagram.com/reel/DRWOto_iG9C/" },
    { img: "../brand-images/box8.png", url: "https://www.instagram.com/p/DFz5BHQyE8a/" },
  ];

  const team = [
    {
      name: "Sahil Virwani",
      role: "Chief Executive Officer",
      image: "../../creator-images/sahil-virwani.jpg",
      bio: "Visionary leader with a passion for Digital storytelling.",
    },
    {
      name: "Sahil Mhasvadkar",
      role: "Chief Operations Officer",
      image: "../../creator-images/sahil-mhasvadkar.jpg",
      bio: "Ensuring smooth operations and strategic growth.",
    },
    {
      name: "Yash Barua",
      role: "Business Alliance and Partnerships",
      image: "../../creator-images/yash-barua.jpg",
      bio: "Brings brands to life with creativity and strategy.",
    },
    {
      name: "Harsh Lad",
      role: "Head of Production",
      image: "../../creator-images/harshlad.png",
      bio: "Leads production with creativity and precision.",
    },
    {
      name: "Paras Bhanushali",
      role: "Social Media Manager",
      image: "../../creator-images/pars.jpg",
      bio: "Key eye for trends and audience engagement.",
    },
    {
      name: "Santosh Rai",
      role: "Editor",
      image: "../../creator-images/Santosh.jpg",
      bio: "Editing raw footage into compelling narratives.",
    },
    {
      name: "Hritik Singh",
      role: "Cinematographer",
      image: "../../creator-images/Hritik-hd.png",
      bio: "Breathing life into scripts through the lens.",
    },
  ];

  return (
    <div className="container">

      {/* Brands Section */}
<h2 className="page-titleabout">Brands We Have Worked With</h2>
<p className="statsabout">(Click on brand logo to explore)</p>
    <div className="brands-grid">
      {brands.map((brand, index) => (
        <a key={index} href={brand.url} target="_blank" rel="noopener noreferrer" className="brand-logo-fac">
          <img src={brand.img} alt={`Brand ${index + 1}`} />
        </a>
      ))}
    </div>



      {/* Company Description */}
      <h1 className="page-titleabout">About FlipaCoin Media</h1>
      <p className="statsabout">
        At FlipaCoin Media, We are revolutionizing the influencer management space with end-to-end
        solutions for brands and creators. <br />
        Focused on creativity and authenticity, we ensure meaningful
        collaborations and lasting value  <br />
        Together, we build equal opportunities for both creators and brands.
      </p>

      {/* Meet the Team */}
      <h2 className="page-titleabout">Meet the Team</h2>
      <div className="grid">
        {team.map((member) => (
          <TeamCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}
