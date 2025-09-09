import React from 'react';
import PropTypes from 'prop-types';

import { ReactComponent as SearchIcon } from '../../icons/MagnifyIcon.svg';

const EmptySearchCard = props => {
  const { toggleDropdown } = props;

  return (
    <div
      className="p-4 text-faded flex justify-center items-center text-base sm:text-xl cursor-pointer focus:outline-none z-50"
      onClick={toggleDropdown}
      role="button"
      tabIndex="0"
    >
      <div className="mx-3">No results found</div>
      <SearchIcon />
    </div>
  );
};
export default EmptySearchCard;

EmptySearchCard.propTypes = {
  toggleDropdown: PropTypes.func
};

EmptySearchCard.defaultProps = {
  toggleDropdown: () => []
};
