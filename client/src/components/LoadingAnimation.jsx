import React from 'react';

import { ReactComponent as MusicNote } from '../icons/QuaverNote.svg';

const LoadingAnimation = () => (
  <div className="h-screen bg-black flex justify-center items-center">
    <div className="loading flex items-center justify-center">
      <span>
        <MusicNote />
      </span>
      <span>
        <MusicNote />
      </span>
      <span>
        <MusicNote />
      </span>
      <div className="line" />
    </div>
  </div>
);

export default LoadingAnimation;
