import React from 'react';
import windowSize from 'react-window-size';
import PropTypes from 'prop-types';

import C2CLogo from '../C2CLogo';
import OctaveLogo from '../OctaveLogo';

class Navbar extends React.Component {
  render() {
    const { history, windowWidth } = this.props;
    return (
      <div className="relative">
        <nav className="h-16 lg:h-20 bg-secondary text-white px-4 sm:px-32 flex items-center">
          <div className="hidden sm:flex justify-start w-1/3">
            <C2CLogo
              height={(() => {
                if (windowWidth > 1600) return '50';
                return '40';
              })()}
            />
          </div>
          <div className="block sm:flex justify-center items-center w-1/2 sm:w-1/3 ">
            <OctaveLogo
              height={(() => {
                if (windowWidth > 1600) return '30';
                return '25';
              })()}
              styles="my-auto"
            />
          </div>

          <div className="w-1/2 sm:w-1/3 focus:outline-none cursor-default text-right">
            <button
              className="text-right hover:text-green-500"
              type="button"
              onClick={() => {
                localStorage.removeItem('token');
                history.push('/');
              }}
            >
              Log Out
            </button>
          </div>
        </nav>
      </div>
    );
  }
}

export default windowSize(Navbar);

Navbar.propTypes = {
  history: PropTypes.objectOf(PropTypes.any),
  windowWidth: PropTypes.number
};

Navbar.defaultProps = {
  history: {},
  windowWidth: 0
};
