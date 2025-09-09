import React from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';

class SectionHeader extends React.Component {
  componentDidMount() {
    gsap.from('.section-header', { opacity: 0, x: -10, duration: 1 });
    gsap.to('.section-header', { opacity: 1, x: 0, duration: 1 });
  }

  render() {
    const { children } = this.props;

    return (
      <header className="section-header text-white section-header text-3xl sm:text-5xl mb-5">
        {children}
      </header>
    );
  }
}

export default SectionHeader;

SectionHeader.propTypes = {
  children: PropTypes.string
};

SectionHeader.defaultProps = {
  children: ''
};
