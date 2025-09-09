/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import windowSize from 'react-window-size';
import PropTypes from 'prop-types';
import gsap from 'gsap';

import C2CLogo from '../C2CLogo';
import OctaveLogo from '../OctaveLogo';

class LandingHeader extends React.Component {
  componentDidMount() {
    gsap.from('header', {
      opacity: 0,
      duration: 2,
      ease: 'circ.out',
      y: -50
    });
    gsap.from('.banner', { opacity: 0, duration: 1, y: -50 });
  }

  render() {
    const { windowWidth } = this.props;

    return (
      <header className="flex col flex-col items-center justify-center w-screen ">
        <C2CLogo
          height={(() => {
            if (windowWidth > 1600) return '113';
            if (windowWidth > 1140) return '96';
            return '60';
          })()}
          styles={(() => {
            if (windowWidth > 1600) return 'my-8';
            if (windowWidth > 1140) return 'my-6';
            return 'my-4';
          })()}
        />
        <OctaveLogo
          height={(() => {
            if (windowWidth > 1600) return '96';
            if (windowWidth > 1140) return '79';
            if (windowWidth > 320) return '50';
            return '40';
          })()}
          styles={(() => {
            if (windowWidth > 1600) return 'my-8';
            if (windowWidth > 1140) return 'my-6';
            if (windowWidth > 870) return 'my-4';
            return '';
          })()}
        />
        <div className="banner font-light text-xl md:text-3xl lg:text-4xl text-center text-white ">
          <span className="text-green-600 ">You </span>
          choose what plays
        </div>
      </header>
    );
  }
}

export default windowSize(LandingHeader);

LandingHeader.propTypes = {
  windowWidth: PropTypes.number
};

LandingHeader.defaultProps = {
  windowWidth: 0
};
