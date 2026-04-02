import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { FormAutocompleteFreeSolo } from '@src/components/form/FormAutocomplete';
import {
  FormResetButton,
  FormSubmitButton,
} from '@src/components/form/FormButtons';
import FormCheckbox from '@src/components/form/FormCheckbox';
import FormFieldSet from '@src/components/form/FormFieldSet';
import FormQuestion from '@src/components/form/FormQuestion';
import FormSelect from '@src/components/form/FormSelect';
import FormTextField from '@src/components/form/FormTextField';

// export useFieldContext for use in your custom components
export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    TextField: FormTextField,
    Select: FormSelect,
    Checkbox: FormCheckbox,
    AutocompleteFreeSolo: FormAutocompleteFreeSolo,
  },
  formComponents: {
    ResetButton: FormResetButton,
    SubmitButton: FormSubmitButton,
    FieldSet: FormFieldSet,
    Question: FormQuestion,
  },
});
