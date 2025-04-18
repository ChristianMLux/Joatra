import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type FormTextFieldProps = Omit<TextFieldProps, "variant" | "label"> & {
  label: string;
};

/**
 * Eine wiederverwendbare Textfeld-Komponente für Formulare,
 * basierend auf MUI TextField mit Standard-Styling.
 */
export const FormTextField: React.FC<FormTextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  fullWidth = true,
  margin = "normal",
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
      variant="outlined"
      InputLabelProps={InputLabelProps}
      {...rest}
    />
  );
};

export default FormTextField;
