import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type FormTextAreaFieldProps = Omit<TextFieldProps, "variant" | "multiline"> & {
  label: string;
  minRows?: number;
};

/**
 * Eine wiederverwendbare Textarea-Komponente für Formulare,
 * basierend auf MUI TextField mit multiline=true.
 */
export const FormTextAreaField: React.FC<FormTextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  fullWidth = true,
  margin = "normal",
  minRows = 3,
  placeholder,
  InputLabelProps = { shrink: true },
  ...rest
}) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth={fullWidth}
      margin={margin}
      multiline
      minRows={minRows}
      placeholder={placeholder}
      variant="outlined"
      InputLabelProps={InputLabelProps}
      {...rest}
    />
  );
};

export default FormTextAreaField;
