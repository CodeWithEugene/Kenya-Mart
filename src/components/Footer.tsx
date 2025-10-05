import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 text-center text-sm text-muted-foreground">
      <span>
        Made with <span aria-label="love" role="img">❤️</span> by
        {" "}
        <a
          href="https://codewitheugene.top/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Eugenius
        </a>
        .
      </span>
    </footer>
  );
};

export default Footer;


