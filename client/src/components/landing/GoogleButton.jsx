import React from 'react';
import windowSize from 'react-window-size';
import PropTypes from 'prop-types';

import GoogleIcon from '../../icons/GoogleIcon.png';

class GoogleButton extends React.Component {
  render() {
    const { windowWidth, type } = this.props;
    return (
      <button
        className="bg-white flex justify-center items-middle text-middle w-48 md:w-64 cursor-pointer my-2 md:my-4 hover:bg-gray-300 flex-stretch"
        type="button"
        onClick={() => {
          window.open(
            `http://login-authentication-app.herokuapp.com/auth?type=${type}`,
            'oauthWindow',
            'height=640,width=480'
          );
        }}
      >
        <div className="flex justify-center items-center mx-3 my-auto">
          <img
            src={GoogleIcon}
            alt="Google Icon"
            height={(() => {
              if (windowWidth > 1140) return '32px';
              return '20px';
            })()}
            width={(() => {
              if (windowWidth > 1140) return '32px';
              return '20px';
            })()}
          />
        </div>
        <div className="mx-3 text-sm md:text-xl">Sign in with Google</div>
      </button>
    );
  }
}

export default windowSize(GoogleButton);

GoogleButton.propTypes = {
  windowWidth: PropTypes.number,
  type: PropTypes.string
};

GoogleButton.defaultProps = {
  windowWidth: 0,
  type: ''
};
