import { memo } from "react";
import { Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Typography component="div" variant="body1" align="center">
      <h1 style={{ display: "inline", font: "inherit", margin: 0, padding: 0 }}>
        Elden Ring Weapon Attack Optimizer - optimize any weapon for ELDEN RING, ELDEN RING Shadow
        of the Erdtree, ELDEN RING Reforged, or The Convergence Mod.
      </h1>
      <br />
      Found a bug?{" "}
      <Link
        href="https://github.com/Roloroma/elden-ring-weapon-optimizer/issues/new"
        target="_blank"
        rel="noopener noreferer"
      >
        Submit an issue here
      </Link>
      .
      <br />
      <Link
        href="https://github.com/ThomasJClark/elden-ring-weapon-calculator"
        target="_blank"
        rel="noopener noreferer"
      >
        Original version
      </Link>{" "}
      is made by Tom Clark (
      <Link href="mailto:tom@tclark.io" target="_blank" rel="noopener noreferer">
        tom@tclark.io
      </Link>
      ). Modded by Roloroma (contact via{" "}
      <Link href="https://github.com/Roloroma" target="_blank" rel="noopener noreferer">
        GitHub
      </Link>
      ). ELDEN RING is a trademark of FromSoftware.
    </Typography>
  );
}

export default memo(Footer);
