import React from "react";
import StartUpErrorContainer from "@Reusable/StartUpErrorContainer";

export default function MobileError() {
  return (
    <StartUpErrorContainer icon="mobile">
      <h2>
        ESL in the ROK is <span>not</span> optimized for this screen size.
      </h2>
      <h3>Please adjust the size or visit us again on a larger screen</h3>
      <hr />
      <h3>WHY?</h3>
      <p>
        This site was made to replace certain PPT game templates used in the classroom.
        It's designed for a larger screen size.
      </p>
      <br />
      <p>Sorry for the inconvenience.</p>
    </StartUpErrorContainer>
  );
}
