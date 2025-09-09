import React from 'react';
import PropTypes from 'prop-types';

import LandingHeader from '../components/landing/LandingHeader';
import LandingGrid from '../components/landing/LandingGrid';

class LandingPage extends React.Component {
  componentDidMount() {
    const { history } = this.props;
    window.addEventListener(
      'message',
      e => {
        if (!(e.data.type === 'token')) return;
        localStorage.setItem('token', e.data.token);
        history.push('/main');
      },
      false
    );
    // localStorage.setItem(
    //   'token',
    //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZDllNzZjMWVmYmI2NDAwMTdjZDI0NmQiLCJuYW1lIjoiS2FzaGlzaCBNaXR0YWwiLCJlbWFpbCI6Imthc2hpc2gubWl0dGFsMjAxOEB2aXRzdHVkZW50LmFjLmluIiwic3RhdGUiOiJpbnQiLCJpYXQiOjE1ODI3MjcxNTl9.kNHC8F4fE8m1gVAAPOchmACK-1A4Uu1rsyLGSa2NKwY'
    // );
  }

  render() {
    const { history } = this.props;
    return (
      <div className="bg-primary flex flex-col justify-evenly h-full cursor-default overflow-x-hidden absolute inset-0">
        <LandingHeader />
        <LandingGrid history={history} />
      </div>
    );
  }
}

export default LandingPage;

LandingPage.propTypes = {
  history: PropTypes.objectOf(PropTypes.any)
};

LandingPage.defaultProps = {
  history: {}
};
