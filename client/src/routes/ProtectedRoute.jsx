/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (localStorage.getItem('token')) {
        return <Component {...props} />;
      }
      return (
        <Redirect
          to={{
            pathname: '/',
            state: {
              from: props.location
            }
          }}
        />
      );
    }}
  />
);

export default ProtectedRoute;

ProtectedRoute.propTypes = {
  component: PropTypes.func,
  location: PropTypes.objectOf(PropTypes.any)
};

ProtectedRoute.defaultProps = {
  component: () => [],
  location: {}
};
