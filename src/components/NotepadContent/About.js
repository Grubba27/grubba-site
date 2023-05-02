import React from "react";

function SponsorButton() {
  return (
    <iframe
      src="https://github.com/sponsors/Grubba27/button"
      title="Sponsor Grubba27"
      height="32"
      width="114"
      style="border: 0; border-radius: 6px;"
    ></iframe>
  );
}

function About({ content }) {
  const { paragraphs } = content;
  return (
    <div>
      <h2>About</h2> - <SponsorButton />
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export default About;
