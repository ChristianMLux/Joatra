import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type FormSelectFieldProps = Omit<TextFieldProps, "variant" | "select"> & {
  label: string;
  children: React.ReactNode;
};

/**
 * Eine wiederverwendbare Select-Komponente für Formulare,
 * basierend auf MUI TextField mit select=true.
 * Verwendet standardmäßig native Select-Elemente für einfachere <option>-Nutzung.
 */
export const FormSelectField: React.FC<FormSelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  fullWidth = true,
  margin = "normal",
  children,
  InputLabelProps = { shrink: true },
  SelectProps = { native: true },
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
      select
      variant="outlined"
      InputLabelProps={InputLabelProps}
      SelectProps={SelectProps}
      {...rest}
    >
      {children}
    </TextField>
  );
};

export default FormSelectField;
