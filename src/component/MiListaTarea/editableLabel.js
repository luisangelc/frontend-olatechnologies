import React, { Component } from "react";
import { anyPass, isEmpty, isNil } from "ramda";
import Radium from "radium";
import PropTypes from "prop-types";
import { generate } from "short-id";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPencilAlt, faTimes } from "@fortawesome/free-solid-svg-icons";

import * as styles from "./editableLabel.style";

/**
 * List of TO-DOs:
 *
*/
class EditableLabel extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      uniqueId: generate(),
      isEditing: false,
      hasError: false,
      previewLabel: this.props.labelValue
    };
  }

  toggleEditMode = () => {
    const { isEditing, previewLabel } = this.state;
    const { customErrorFunction, editChangeEvent } = this.props;

    if (isEditing === true) {
      const hasError = customErrorFunction(previewLabel);

      if (hasError) {
        this.setState({ hasError });
        return;
      }

      if (editChangeEvent) {
        this.setState({ isEditing: false });
        editChangeEvent(previewLabel);
      }

      return;
    }

    this.setState({ isEditing: true });
  };

  cancelEditMode = () => {
    const { labelValue } = this.props;
    this.setState({
      isEditing: false,
      previewLabel: labelValue,
      hasError: false
    });
  };

  simpleLabelWithClickAction = () => {
    const {
      labelValue,
      labelStyle,
      placeholder,
      placeholderStyle,
      hoveringStyle,
      customEditIcon,
      customEditIconStyle
    } = this.props;

    const showPlaceholder = isEmptyOrNil(labelValue);
    const showableLabel = showPlaceholder ? placeholder : labelValue;
    const isHovering = Radium.getState(this.state, "label-value", ":hover");

    const labelStyling = [
      styles.labelStyle,
      !showPlaceholder && !isHovering && labelStyle,
      showPlaceholder && !isHovering && placeholderStyle,
      isHovering && hoveringStyle
    ];

    const editIcon = (
      <span style={[styles.editIcon, customEditIconStyle]}>
        {customEditIcon}
      </span>
    );

    return (
      <p key="label-value" style={labelStyling} onClick={this.toggleEditMode}>
        {showableLabel}
        {isHovering && editIcon}
      </p>
    );
  };

  watchForEnterClick = event => {
    if (event.keyCode === 13) {
      const { hasError } = this.state;
      if (!hasError) {
        this.toggleEditMode();
      }
    }
  };

  inputOnChangeEvent = event => {
    const previewLabel = event.target.value;

    if (previewLabel.length > 0) {
      this.setState({
        hasError: false,
        previewLabel
      });
      return;
    }

    this.setState({ previewLabel });
  };

  inputToEditLabel = () => {
    const { previewLabel } = this.state;
    const {
      inputStyle,
      customCloseIcon,
      customCancelIconStyle,
      customApproveIcon,
      customApproveIconStyle
    } = this.props;

    return [
      <input
        type="text"
        value={previewLabel}
        key="input-value-label"
        style={[styles.inputStyle, inputStyle]}
        onChange={this.inputOnChangeEvent}
        onKeyUp={this.watchForEnterClick}
        autoFocus
      />,
      <button
        style={[styles.buttonStyle, customCancelIconStyle]}
        key="input-value-cancel-button"
        onClick={this.cancelEditMode}
      >
        {customCloseIcon}
      </button>,
      <button
        style={[styles.buttonStyle, customApproveIconStyle]}
        key="input-value-approve-button"
        onClick={this.toggleEditMode}
      >
        {customApproveIcon}
      </button>
    ];
  };

  getErrorMessage = () => {
    const { hasError } = this.state;
    const { hideErrors, customErrorMessage, errorStyle } = this.props;
    const showErrors = !hideErrors && hasError;
    const errorTextStyle = [styles.errorText, errorStyle];

    if (showErrors && Array.isArray(customErrorMessage)) {
      return (
        <ul style={errorTextStyle}>
          {customErrorMessage.map(error => (
            <li key={generate()}>{error}</li>
          ))}
        </ul>
      );
    }

    if (showErrors) {
      return <span style={errorTextStyle}>{customErrorMessage}</span>;
    }

    return null;
  };

  render() {
    const { id, isEditing, uniqueId, style } = this.state;

    const showThisComponent = isEditing
      ? this.inputToEditLabel()
      : this.simpleLabelWithClickAction();
    const error = this.getErrorMessage();
    const componentId = isEmptyOrNil(id) ? `editable-label-id-${uniqueId}` : id;

    return (
      <div id={componentId} key={componentId} style={style}>
        {showThisComponent}
        {error}
      </div>
    );
  }
}

const isEmptyOrNil = anyPass([isEmpty, isNil]);

EditableLabel.defaultProps = {
  id: null,
  hideErrors: false,
  customErrorMessage: "Invalid input entry",
  customErrorFunction: isEmptyOrNil,
  customEditIcon: <FontAwesomeIcon icon={faPencilAlt} />,
  customCloseIcon: <FontAwesomeIcon icon={faTimes} />,
  customApproveIcon: <FontAwesomeIcon icon={faCheck} />,
  placeholder: null,
  customApproveIconStyle: {},
  customCancelIconStyle: {},
  customEditIconStyle: {},
  inputStyle: {},
  labelStyle: {},
  errorStyle: {},
  style: {},
  placeholderStyle: {},
  hoveringStyle: {}
};

EditableLabel.propTypes = {
  id: PropTypes.string,
  labelValue: PropTypes.string.isRequired,
  editChangeEvent: PropTypes.func.isRequired,
  hideErrors: PropTypes.bool,
  customErrorMessage: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.array
  ]),
  customErrorFunction: PropTypes.func,
  customEditIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  customEditIconStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  customCloseIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  customCancelIconStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  customApproveIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  customApproveIconStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  errorStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  placeholder: PropTypes.string,
  placeholderStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  hoveringStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default Radium(EditableLabel);