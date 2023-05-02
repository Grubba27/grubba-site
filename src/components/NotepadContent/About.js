import React from "react";

function SponsorButton() {
  return (
    <iframe
      src="https://github.com/sponsors/Grubba27/button"
      title="Sponsor Grubba27"
      height="32"
      width="114"
      style={{ border: 0, borderRadius: 6 }}
    ></iframe>
  );
}

function About({ content }) {
  const { paragraphs } = content;
  return (
    <div>
      <h2>About </h2> 
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <SponsorButton />
    </div>
  );
}

export default About;
