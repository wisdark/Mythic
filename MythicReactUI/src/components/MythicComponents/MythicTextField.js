import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {TextField} from '@mui/material';
const PREFIX = 'MythicTextField';

const classes = {
    root: `${PREFIX}-root`
};

const Root = styled('div')({
      [`&.${classes.root}`]: {
        '& input:valid + fieldset': {
          borderColor: 'grey',
          borderWidth: 1,
        },
        '& input:invalid + fieldset': {
          borderColor: 'red',
          borderWidth: 2,
        },
        '& input:valid:focus + fieldset': {
          borderLeftWidth: 6,
          padding: '4px !important', // override inline-style
        },
      },
    });

const ValidationTextField = TextField;

class MythicTextField extends React.Component {
    
    static propTypes = {
        placeholder: PropTypes.string,
        name: PropTypes.string,
        validate: PropTypes.func,
        width: PropTypes.number,
        onChange: PropTypes.func.isRequired,
        requiredValue: PropTypes.bool,
        type: PropTypes.string,
        onEnter: PropTypes.func,
        autoFocus: PropTypes.bool,
        autoComplete: PropTypes.bool,
        showLabel: PropTypes.bool,
        variant: PropTypes.string,
        inline: PropTypes.bool,
        marginBottom: PropTypes.string,
        value: PropTypes.any,
        disabled: PropTypes.bool,
    }
    onChange = evt => {
        const name = this.props.name;
        const value = evt.target.value;
        const error = this.props.validate ? this.props.validate(value) : false;
        this.props.onChange(name, value, error, evt);
    }
    checkError = () => {
        return this.props.validate ? this.props.validate(this.props.value) : false
    }
    onKeyPress = (event) => {
      if(event.key === "Enter") {
          if(event.shiftKey){
              this.onChange(event);
              return;
          }
          if (this.props.onEnter !== undefined) {
              event.stopPropagation();
              event.preventDefault();
              this.props.onEnter(event);
          }
      }else{
        this.onChange(event);
      }
    }
    render(){
        return (
            <Root style={{width:  this.props.width ? this.props.width + "rem" : "100%", display: this.props.inline ? "inline-block": "",}}>
                <ValidationTextField
                    fullWidth={true}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={this.onChange}
                    color={"secondary"}
                    onKeyDown={this.onKeyPress}
                    label={this.props.showLabel === undefined ? this.props.name : this.props.showLabel ? this.props.name : undefined}
                    autoFocus={this.props.autoFocus}
                    variant={this.props.variant === undefined ? "outlined" : this.props.variant}
                    data-lpignore={true}
                    autoComplete={this.props.autoComplete === undefined ? "new-password" : (this.props.autoComplete ? "on" : "new-password")}
                    disabled={this.props.disabled === undefined ? false : this.props.disabled}
                    required={this.props.requiredValue ? this.props.requiredValue : false}
                    InputLabelProps={this.props.inputLabelProps}
                    multiline={this.props.multiline ? this.props.multiline : false}
                    maxRows={this.props.maxRows}
                    error={this.checkError()}
                    type={this.props.type === undefined ? "text" : this.props.type}
                    onWheel={ event => event.target.blur() }
                    InputProps={{...this?.props?.InputProps, spellCheck: false}}
                    helperText={this.checkError() ? this.props.errorText : this.props.helperText}
                    style={{
                        padding:0,
                        marginBottom: this.props.marginBottom ? this.props.marginBottom : "10px",
                        display: this.props.inline ? "inline-block": "",
                    }}
                    classes={{
                        root: classes.root
                    }} />
            </Root>
        );
    }
}
export default MythicTextField;
