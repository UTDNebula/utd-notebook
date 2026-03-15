import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useFieldContext } from '@src/utils/form';

type StyledTextFieldProps = TextFieldProps;

export function StyledTextField(props: StyledTextFieldProps) {
  return (
    <TextField
      size={props.size ?? (props.multiline ? 'medium' : 'small')}
      {...props}
      className={`[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-neutral-900 w-64 ${props.className}`}
    />
  );
}

type FormTextFieldFieldPropsBase = { label?: string; maxLength?: number };

type FormTextFieldFieldProps = Omit<
  TextFieldProps,
  keyof FormTextFieldFieldPropsBase
> &
  FormTextFieldFieldPropsBase;

export default function FormTextField({
  label,
  helperText,
  maxLength,
  ...props
}: FormTextFieldFieldProps) {
  const field = useFieldContext<string>();
  const currentLength = field.state.value?.length ?? 0;
  const characterCount = maxLength
    ? `${currentLength}/${maxLength} characters`
    : '';
  const errorMessage = !field.state.meta.isValid
    ? field.state.meta.errors.map((err) => err?.message).join('. ') + '.'
    : undefined;

  const displayHelperText =
    [
      errorMessage || (typeof helperText === 'string' ? helperText : ''),
      characterCount,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <StyledTextField
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      error={!field.state.meta.isValid}
      helperText={displayHelperText}
      label={label}
      {...props}
    />
  );
}
