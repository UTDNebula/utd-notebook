import { Checkbox, FormControlLabel } from '@mui/material';
import { useFieldContext } from '@src/utils/form';

interface FormCheckboxProps {
  label?: string;
  className?: string;
}

export default function FormCheckbox({ label, className }: FormCheckboxProps) {
  const field = useFieldContext<boolean>();

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={field.state.value ?? false}
          onChange={(e) => field.handleChange(e.target.checked)}
        />
      }
      label={label}
      className={className}
    ></FormControlLabel>
  );
}
